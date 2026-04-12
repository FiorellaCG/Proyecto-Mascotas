from rest_framework import serializers
from .models import Reservacion, Reservacionpaquete, Tipoestancia, Estadoreservacion, Paqueteadicional
from mascotas.models import Mascota
from habitaciones.models import Habitacion
from django.utils.timezone import now

class TipoEstanciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipoestancia
        fields = ['tipo_estancia_id', 'nombre', 'hora_inicio', 'hora_fin', 'es_indefinida']

class EstadoReservacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estadoreservacion
        fields = ['estado_reservacion_id', 'nombre']

class PaqueteAdicionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paqueteadicional
        fields = ['paquete_id', 'nombre', 'descripcion', 'activo']

class ReservacionPaqueteSerializer(serializers.ModelSerializer):
    paquete = PaqueteAdicionalSerializer(read_only=True)
    
    class Meta:
        model = Reservacionpaquete
        fields = ['reservacion_paquete_id', 'paquete']

class ReservacionListSerializer(serializers.ModelSerializer):
    mascota_nombre = serializers.SerializerMethodField()
    habitacion_numero = serializers.SerializerMethodField()
    url_camara = serializers.SerializerMethodField()
    tipo_estancia = TipoEstanciaSerializer(read_only=True)
    estado_reservacion = EstadoReservacionSerializer(read_only=True)
    paquetes = ReservacionPaqueteSerializer(many=True, read_only=True, source='paquetes_contratados')

    class Meta:
        model = Reservacion
        fields = [
            'reservacion_id', 'fecha_inicio', 'fecha_fin', 'es_indefinida', 
            'observaciones', 'creada_en', 'mascota_nombre', 'habitacion_numero',
            'tipo_estancia', 'estado_reservacion', 'paquetes', 'url_camara'
        ]

    def get_url_camara(self, obj):
        return obj.habitacion.url_camara or None

    def get_mascota_nombre(self, obj):
        return obj.mascota.nombre if obj.mascota else None

    def get_habitacion_numero(self, obj):
        return obj.habitacion.numero if obj.habitacion else None

class ReservacionCreateSerializer(serializers.Serializer):
    mascota_id = serializers.IntegerField(required=True)
    habitacion_id = serializers.IntegerField(required=True)
    tipo_estancia_id = serializers.IntegerField(required=True)
    fecha_inicio = serializers.DateField(required=True)
    fecha_fin = serializers.DateField(required=False, allow_null=True)
    es_indefinida = serializers.BooleanField(default=False)
    observaciones = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    paquetes_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])

    def validate(self, data):
        usuario_id = self.context.get('usuario_id')
        
        # Validar mascota
        mascota_id = data.get('mascota_id')
        try:
            mascota = Mascota.objects.get(pk=mascota_id)
        except Mascota.DoesNotExist:
            raise serializers.ValidationError({'mascota_id': 'Mascota no encontrada.'})

        if not mascota.aprobada:
            raise serializers.ValidationError({'mascota_id': 'La mascota debe estar aprobada.'})

        if mascota.dueno_usuario_id != self.context.get('usuario_id'):
            raise serializers.ValidationError({'mascota_id': 'Esta mascota no te pertenece.'})

        # Validar habitación
        habitacion_id = data.get('habitacion_id')
        try:
            habitacion = Habitacion.objects.get(habitacion_id=habitacion_id)
            if habitacion.estado_habitacion.nombre != 'Disponible':
                raise serializers.ValidationError('La habitación no está disponible')
        except Habitacion.DoesNotExist:
            raise serializers.ValidationError("La habitación no existe.")

        return data

    def create(self, validated_data):
        paquetes_ids = validated_data.pop('paquetes_ids', [])
        
        try:
            estado_pendiente = Estadoreservacion.objects.get(nombre='Pendiente')
        except Estadoreservacion.DoesNotExist:
            raise serializers.ValidationError("Error interno: Estado 'Pendiente' no encontrado.")

        validated_data['creada_en'] = now()
        validated_data['estado_reservacion_id'] = estado_pendiente.estado_reservacion_id
        
        reservacion_obj = Reservacion.objects.create(**validated_data)
        
        for p_id in paquetes_ids:
            Reservacionpaquete.objects.create(
                reservacion=reservacion_obj,
                paquete_id=p_id
            )
            
        return reservacion_obj

class CambiarEstadoReservacionSerializer(serializers.ModelSerializer):
    estado_reservacion_id = serializers.IntegerField(required=True)

    class Meta:
        model = Reservacion
        fields = ['estado_reservacion_id']

    def validate_estado_reservacion_id(self, value):
        if not Estadoreservacion.objects.filter(estado_reservacion_id=value).exists():
            raise serializers.ValidationError("El estado de reservación no existe.")
        return value
