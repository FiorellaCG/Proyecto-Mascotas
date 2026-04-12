from django.urls import path
from .views import (
    MisReservacionesView, CrearReservacionView,
    TodasReservacionesView, CambiarEstadoReservacionView,
    TiposEstanciaView, PaquetesAdicionalesView, HabitacionesDisponiblesView,
)

urlpatterns = [
    # Dueño
    path('mis-reservaciones/',              MisReservacionesView.as_view()),
    path('crear/',                          CrearReservacionView.as_view()),
    # Admin
    path('todas/',                          TodasReservacionesView.as_view()),
    path('<int:reservacion_id>/estado/',    CambiarEstadoReservacionView.as_view()),
    # Catálogos
    path('tipos-estancia/',                 TiposEstanciaView.as_view()),
    path('paquetes/',                       PaquetesAdicionalesView.as_view()),
    path('habitaciones-disponibles/',       HabitacionesDisponiblesView.as_view()),
]
