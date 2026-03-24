from django.urls import path
from .views import (
    MisMascotasView, RegistrarMascotaView, MascotaDetalleView,
    MascotasPendientesView, AprobarMascotaView, TodasMascotasView,
    NivelesAsistenciaView, TiposCuidadoView
)

urlpatterns = [
    path('mis-mascotas/', MisMascotasView.as_view()),
    path('registrar/', RegistrarMascotaView.as_view()),
    path('<int:pk>/', MascotaDetalleView.as_view()),
    path('pendientes/', MascotasPendientesView.as_view()),
    path('<int:pk>/aprobar/', AprobarMascotaView.as_view()),
    path('todas/', TodasMascotasView.as_view()),
    path('niveles-asistencia/', NivelesAsistenciaView.as_view()),
    path('tipos-cuidado/', TiposCuidadoView.as_view()),
]
