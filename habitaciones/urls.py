from django.urls import path
from .views import (
    ListAllHabitacionesView,
    HabitacionDetailView,
    ListLimpiezasView,
    ListMantenimientosView,
    TiposHabitacionView,
    EstadosHabitacionView,
    HabitacionesPersonalView,
    MisLimpiezasView,
    CompletarMantenimientoView,
    CrearHabitacionView,
    EditarCamaraView,
)

urlpatterns = [
    path('crear/',                                  CrearHabitacionView.as_view()),
    path('',                                        ListAllHabitacionesView.as_view()),
    path('personal/',                               HabitacionesPersonalView.as_view()),
    path('mis-limpiezas/',                          MisLimpiezasView.as_view()),
    path('tipos/',                                  TiposHabitacionView.as_view()),
    path('estados/',                                EstadosHabitacionView.as_view()),
    path('<int:pk>/',                               HabitacionDetailView.as_view()),
    path('<int:pk>/camara/',                        EditarCamaraView.as_view()),
    path('<int:habitacion_id>/limpiezas/',          ListLimpiezasView.as_view()),
    path('<int:habitacion_id>/mantenimientos/',     ListMantenimientosView.as_view()),
    path('mantenimientos/<int:mantenimiento_id>/completar/', CompletarMantenimientoView.as_view()),
]
