from rest_framework.decorators import api_view
from .serializers import UserLoginSerializer,UserSignupSerializer, ProfileSerializer, UpdateProfileSerializer
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Profile  
from rest_framework.permissions import IsAuthenticated
from django_otp import user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode
import io
from django.http import HttpResponse
from django.shortcuts import render
import base64
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import json	
from .serializers import UserLoginSerializer  # Add the missing import statement
from rest_framework.parsers import JSONParser
from .serializers import UserSignupSerializer
from .serializers import ProfileSerializer
from django.db.models import Q
from django.http import JsonResponse
from .models import Profile
from django.contrib.auth.models import User
from rest_framework.response import Response
from django.db import transaction
from django.conf import settings
import requests
import datetime
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
import pytz
# uvicorn ft_transcendence.asgi:application --host 0.0.0.0 --ssl-keyfile=localhost.key --ssl-certfile=localhost.crt --port 8000 --ws 'websockets'
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
	serializer = UserLoginSerializer(data=request.data)		
	if serializer.is_valid():
		email = serializer.validated_data['email']
		password = serializer.validated_data['password']
		try:
			username = User.objects.get(email=email).username
		except:
			return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
		user = User.objects.get(username=username)
		user = authenticate(request, username=username, password=password)
		if user is not None:
			if user.profile.fa_enabled == True:
				return Response({'message': 'FA', 'username':username}, status=status.HTTP_202_ACCEPTED)
			user.profile.online_status = True
			user.profile.save()
			login(request, user)
			return Response({'message': 'Success', 'username':username}, status=status.HTTP_200_OK) # profil bilgilerini yolla
		else:
			return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
	try:
		username = request.data.get('username', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
	if user.is_authenticated:
		logout(request)
		user.profile.online_status = False
		user.profile.save()
		return Response({'message': 'Success'}, status=status.HTTP_200_OK)
	return Response({'message': 'Not logged in'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_user(request):
	serializer = UserSignupSerializer(data=request.data)
	if serializer.is_valid():
		email = serializer.validated_data['email']
		password = serializer.validated_data['password']    
		username = serializer.validated_data['username']    
		if username.endswith('_42'):
			return Response({"error": "Username cannot end with '_42'."}, status=status.HTTP_400_BAD_REQUEST)
		if User.objects.filter(Q(username=username) | Q(email=email)).exists():
			return Response({'message': 'This email/username is already in use'}, status=status.HTTP_400_BAD_REQUEST)
		
		with transaction.atomic():
			user = User.objects.create_user(username=username, email=email, password=password)
			profile = Profile.objects.create(user=user)
			user.save()
		return Response({'message': 'Signup successful'}, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def find_profile(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
	profile_data = {'username': user.username, 'bio': user.profile.bio, 'win_count': user.profile.win_count, 'lose_count': user.profile.lose_count, 'online_status': user.profile.online_status}
	return JsonResponse({'profile': profile_data, 'message':'Success'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def show_profile(request):
    try:
        data = json.loads(request.body)
        username = data.get('username', None)
        user = User.objects.get(username=username)

    except User.DoesNotExist:
        return JsonResponse({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except:
        return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
    serializer_data = {'profile': ProfileSerializer(user.profile).data, 'username': username}
    return JsonResponse(serializer_data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_avatar(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
	avatar = user.profile.avatar
	with open(avatar.path, 'rb') as f:
		return HttpResponse(f.read(), content_type='image/jpeg')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
		
    try:
        data = json.loads(request.POST.get('data'))
        username = data.get('username', None)
        new_username = data.get('new_username', None)
        bio = data.get('bio', None)
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'message': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({'message': f'Error: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    avatar = request.FILES.get('avatar')
    if avatar:
        user.profile.avatar = avatar
        user.profile.save()

    if bio is not None and bio != user.profile.bio and bio != '':
        user.profile.bio = bio
        user.profile.save()
    print(new_username)
    if new_username and new_username != username and not User.objects.filter(username=new_username).exists() and new_username != '':
        user.username = new_username
        user.save()
        print(user.username)
    return JsonResponse({'message': 'Profile updated'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_qr_code(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		totp = data.get('otp', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
	if totp == 'disable':
		user.profile.fa_enabled = False
		user.profile.save()
		return JsonResponse({'message': '2FA disabled'}, status=status.HTTP_200_OK)
	device = TOTPDevice.objects.get(user=user)
	if device.verify_token(totp):
		user.profile.fa_enabled = True
		user.profile.save()
		return JsonResponse({'message': 'Success'}, status=status.HTTP_200_OK)
	return JsonResponse({'message': '2FA did not enabled'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'POST'])
@permission_classes([IsAuthenticated])
def get_qr_code(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
	if not user_has_device(user):
		device = TOTPDevice.objects.create(user=user, name='default')
		device.save()
		url = device.config_url
		img = qrcode.make(url)
		buffered = io.BytesIO()
		img.save(buffered)
		svg_data = base64.b64encode(buffered.getvalue()).decode()
		return JsonResponse({'qr_code_url': svg_data})
	elif user_has_device(user):
		device = TOTPDevice.objects.get(user=user)
		url = device.config_url
		img = qrcode.make(url)
		buffered = io.BytesIO()
		img.save(buffered)
		svg_data = base64.b64encode(buffered.getvalue()).decode()
		return JsonResponse({'qr_code_url': svg_data})
	return JsonResponse({'message': 'Device already configured'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def validate_qr_code(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		otp = data.get('otp', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username or otp provided'}, status=status.HTTP_400_BAD_REQUEST)
	device = TOTPDevice.objects.get(user=user)
	if device.verify_token(otp):
		user.profile.online_status = True
		user.profile.save()
		login(request, user)
		return JsonResponse({'message': 'Success'}, status=status.HTTP_200_OK)
	return JsonResponse({'message': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
	friend_requests = user.profile.received_friend_requests.all()
	if not friend_requests.exists():
		return JsonResponse({'success': True, 'message': 'No friend requests'}, status=status.HTTP_200_OK)
	return JsonResponse({'success': True, 'friend_requests': [{'username': user.username, 'bio': user.profile.bio} for user in friend_requests]})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
	try:
		data = json.loads(request.body)
		username_sender = data.get('username_sender', None)
		username_receiver = data.get('username_receiver', None)
		user_sender = User.objects.get(username=username_sender)
		user_receiver = User.objects.get(username=username_receiver)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST) 

	if user_sender in user_receiver.profile.friends.all():
		return JsonResponse({'message': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)
	if user_sender in user_receiver.profile.received_friend_requests.all():
		return JsonResponse({'message': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)
	if user_receiver in user_sender.profile.received_friend_requests.all():
		return JsonResponse({'message': 'Friend request already received'}, status=status.HTTP_400_BAD_REQUEST)
	user_receiver.profile.received_friend_requests.add(user_sender)
	user_sender.profile.sended_friend_requests.add(user_receiver)
	return JsonResponse({'message': 'Friend request sent'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request):
	try:
		data = json.loads(request.body)
		username_sender = data.get('username_sender', None)
		username_receiver = data.get('username_receiver', None)
		user_sender = User.objects.get(username=username_sender)
		user_receiver = User.objects.get(username=username_receiver)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)

	if user_sender in user_receiver.profile.friends.all():
		return JsonResponse({'message': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)
	if user_sender in user_receiver.profile.received_friend_requests.all():
		user_receiver.profile.received_friend_requests.remove(user_sender)
		user_sender.profile.sended_friend_requests.remove(user_receiver)
		user_receiver.profile.friends.add(user_sender)
		user_sender.profile.friends.add(user_receiver)
		user_receiver.save()
		user_sender.save()
		return JsonResponse({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def find_user(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		username_sender = data.get('username_sender', None)
		username_sender_user = User.objects.get(username=username_sender)

	except:
		return JsonResponse({'message': 'No users found'}, status=status.HTTP_400_BAD_REQUEST)
	users = User.objects.filter(username__icontains=username)
	users = users.exclude(username__in=username_sender_user.profile.friends.all().values_list('username', flat=True))
	if username_sender_user in users:
		users = users.exclude(username=username_sender)
	if users.exists():
		return JsonResponse({'success': True, 'user_infos': [{'username': user.username} for user in users]}, status=status.HTTP_200_OK)
		#return JsonResponse({'success':True ,'user_infos': [{'username': user.username , 'bio':user.profile.bio} for user in users]}, status=status.HTTP_200_OK)

	return JsonResponse({'message': 'No users found'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def matchmaking_history(request):
    try:
        data = json.loads(request.body)
        username = data.get('username', None)
    except:
        return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    rooms = sorted(user.profile.game_room.all(), key=lambda room: room.created_at)
    turkey_timezone = pytz.timezone('Europe/Istanbul')
    match_history = [{'user_host': room.user_host, 'user_guest': room.user_guest, "score_host": room.score_host, "score_guest": room.score_guest, 'created_at': room.created_at.astimezone(turkey_timezone).strftime("%Y-%m-%d %H:%M:%S")} for room in rooms]
    return JsonResponse({'success': True, 'match_history': match_history}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def list_friends(request):
	try:
		data = json.loads(request.body)
		username = data.get('username', None)
		user = User.objects.get(username=username)
	except:
		return JsonResponse({'message': 'No username provided'}, status=status.HTTP_400_BAD_REQUEST)
	friends = user.profile.friends.all()

	if not friends.exists():
		return JsonResponse({'success': True}, status=status.HTTP_200_OK)
	return JsonResponse({'success': True, 'friends': [{'username': friend.username, 'online':friend.profile.online_status} for friend in friends]}, status=status.HTTP_200_OK)


def create_token(username):
    user = User.objects.get(username=username)
    refresh = RefreshToken.for_user(user)
    return {
		'refresh': str(refresh),
		'access': str(refresh.access_token),
	}


def getToken(code):
	print("calistim")
	try:
		data = {
			'grant_type': 'authorization_code',
			'client_id': settings.UID_42,
			'client_secret': settings.SECRET_42,
			'code': code,
			'redirect_uri': settings.REDIRECT_URI_42
		}
		response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
		response_json = response.json()
		if 'access_token' in response_json:
			return response_json['access_token']
		else:
			print("No access token in response")
			return "No token found"
	except Exception as e:
		print(e)
		return "No token found"

def getUser(token):
	print("calistim")
	try:
		response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': 'Bearer ' + token})
		return response.json()
	except:
		return "No user found"


def save_img(url, username):
	print("burada")
	try:
		response = requests.get(url)
		with open(f'./avatars/{username}.jpg', 'wb') as f:
			f.write(response.content)
		return f'./avatars/{username}.jpg'
	except:
		return "No image found"


@api_view(['GET'])
@permission_classes([AllowAny])
def deneme(request):
	print("deneme")
	print(request.GET.get('code', ''))
	token = getToken(request.GET.get('code', ''))
	print(f"token : {token}")
	user = getUser(token)
	print(user)
	if user != "No user found":
		username = user.get('login') + "_42"
		email = user.get('email')
		if User.objects.filter(Q(username=username) | Q(email=email)).exists():
			user = User.objects.get(Q(username=username) | Q(email=email))
			profile = Profile.objects.get(user=user)
			login(request, User.objects.get(username=username))
			tokens = create_token(username)
			access = tokens['access']
			refresh = tokens['refresh']
			profile.online_status = True
			profile.save()
			user.save()
			return JsonResponse({'message': 'Success', 'username': username, 'access':access, 'refresh':refresh}, status=status.HTTP_200_OK)
		else:
			image = user.get('image').get('link')
			user = User.objects.create_user(username=username, email=email)
			profile = Profile.objects.create(user=user , avatar_42 = image, avatar = save_img(image, username))
			profile.online_status = True
			tokens = create_token(username)
			access = tokens['access']
			refresh = tokens['refresh']
			profile.save()
			user.save()
			login(request, user)
			return JsonResponse({'message': 'Success', 'username': user.username, 'access':access, 'refresh':refresh}, status=status.HTTP_200_OK)

	return JsonResponse({'message': 'Failed ! There is something wrong !'}, status=status.HTTP_404_NOT_FOUND)