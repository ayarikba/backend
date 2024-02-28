from . import views
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
	path('login/', views.login_user, name='login'),
	path('logout/', views.logout_user, name='logout'),
	path('signup/', views.signup_user, name='signup'),
	path('show_profile/', views.show_profile, name='show_profile'),
	path('update_profile/', views.update_profile, name='updateprofile'),
	path('send_friend_request/', views.send_friend_request, name='send_friend_request'),
	path('accept_friend_request/', views.accept_friend_request, name='accept_friend_request'),
	path('matchmaking_history/', views.matchmaking_history, name='matchmaking_history'),
	path('find_user/', views.find_user, name='find_user'),
	path('accept_friend_request/', views.accept_friend_request, name='accept_friend_request'),
	path('send_friend_request/', views.send_friend_request, name='send_friend_request'),
	path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('get_qr/', views.get_qr_code, name='get_qr_code'),
	path('validate_qr/', views.validate_qr_code, name='validate_qr_code'),
	path('enable_qr/', views.enable_qr_code, name='enable_qr_code'),
	path('get_avatar/', views.get_avatar, name='get_avatar'),
	path('get_friend_requests/', views.get_friend_requests, name='get_friend_requests'),
	path('deneme/', views.deneme, name='deneme'),
	path('list_friends/', views.list_friends, name='list_friends'),
	path('find_profile/', views.find_profile, name='find_profile'),
]

