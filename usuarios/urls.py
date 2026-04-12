from django.urls import path
from usuarios.views import LoginView, LogoutView, MeView, RegistroView, ListarUsuariosView, CrearUsuarioView, ListarRolesView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('registro/', RegistroView.as_view(), name='registro'),
    path('admin/listar/', ListarUsuariosView.as_view()),
    path('admin/crear/', CrearUsuarioView.as_view()),
    path('admin/roles/', ListarRolesView.as_view()),
]
