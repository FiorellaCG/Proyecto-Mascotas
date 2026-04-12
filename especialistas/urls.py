from django.urls import path
from .views import ListarEspecialistasView, CrearEspecialistaView, ListarTurnosView

urlpatterns = [
    path('', ListarEspecialistasView.as_view(), name='listar-especialistas'),
    path('crear/', CrearEspecialistaView.as_view(), name='crear-especialista'),
    path('turnos/', ListarTurnosView.as_view(), name='listar-turnos'),
]
