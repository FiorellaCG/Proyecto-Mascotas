from django.urls import path
from .views import (
    NivelesAsistenciaView, TiposCuidadoView,
    MisMascotasView, RegistrarMascotaView, MascotaDetalleView,
    MascotasPendientesView, AprobarMascotaView, TodasMascotasView,
)

urlpatterns = [
    path('niveles-asistencia/',       NivelesAsistenciaView.as_view()),
    path('tipos-cuidado/',            TiposCuidadoView.as_view()),
    path('mis-mascotas/',             MisMascotasView.as_view()),
    path('registrar/',                RegistrarMascotaView.as_view()),
    path('<int:mascota_id>/',         MascotaDetalleView.as_view()),
    path('pendientes/',               MascotasPendientesView.as_view()),
    path('<int:mascota_id>/aprobar/', AprobarMascotaView.as_view()),
    path('todas/',                    TodasMascotasView.as_view()),
]
