from django.urls import path
from .views import (
    ListAllHabitacionesView,
    HabitacionDetailView,
    RegistrarLimpiezaView,
    ListLimpiezasView,
    ListMantenimientosView,
    TiposHabitacionView,
    EstadosHabitacionView,
)

urlpatterns = [
    # RF-24: Tipos de habitación
    path('tipos/', TiposHabitacionView.as_view(), name='tipos_habitacion'),
    
    # Estados de habitación (auxiliar)
    path('estados/', EstadosHabitacionView.as_view(), name='estados_habitacion'),
    
    # RF-19: Listar todas las habitaciones
    path('', ListAllHabitacionesView.as_view(), name='lista_habitaciones'),
    
    # RF-20: Detalle y actualizar habitación
    path('<int:pk>/', HabitacionDetailView.as_view(), name='detalle_habitacion'),
    
    # RF-21: Registrar limpieza
    path('<int:habitacion_id>/limpiezas/', RegistrarLimpiezaView.as_view(), name='registrar_limpieza'),
    
    # RF-22: Listar limpiezas
    path('<int:habitacion_id>/limpiezas/', ListLimpiezasView.as_view(), name='listar_limpiezas'),
    
    # RF-23: Listar y crear mantenimientos
    path('<int:habitacion_id>/mantenimientos/', ListMantenimientosView.as_view(), name='listar_mantenimientos'),
]
