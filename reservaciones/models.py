from django.db import models
from mascotas.models import Mascota
from habitaciones.models import Habitacion


class Tipoestancia(models.Model):
    tipo_estancia_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50, db_collation='Modern_Spanish_CI_AI')
    hora_inicio = models.TimeField(blank=True, null=True)
    hora_fin = models.TimeField(blank=True, null=True)
    es_indefinida = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'TipoEstancia'

    def __str__(self):
        return self.nombre


class Estadoreservacion(models.Model):
    estado_reservacion_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50, db_collation='Modern_Spanish_CI_AI')

    class Meta:
        managed = False
        db_table = 'EstadoReservacion'

    def __str__(self):
        return self.nombre


class Paqueteadicional(models.Model):
    paquete_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=80, db_collation='Modern_Spanish_CI_AI')
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'PaqueteAdicional'

    def __str__(self):
        return self.nombre


class Reservacion(models.Model):
    reservacion_id = models.AutoField(primary_key=True)
    mascota = models.ForeignKey(
        Mascota, models.DO_NOTHING,
        related_name='reservaciones'
    )
    habitacion = models.ForeignKey(
        Habitacion, models.DO_NOTHING,
        related_name='reservaciones_habitacion'
    )
    tipo_estancia = models.ForeignKey(
        Tipoestancia, models.DO_NOTHING,
        related_name='reservaciones_por_estancia'
    )
    estado_reservacion = models.ForeignKey(
        Estadoreservacion, models.DO_NOTHING,
        related_name='reservaciones_por_estado'
    )
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(blank=True, null=True)
    es_indefinida = models.BooleanField()
    observaciones = models.CharField(max_length=500, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    creada_en = models.DateTimeField()
    modificada_en = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Reservacion'

    def __str__(self):
        return f'Reservación #{self.reservacion_id} — {self.mascota.nombre}'


class Reservacionpaquete(models.Model):
    reservacion_paquete_id = models.AutoField(primary_key=True)
    reservacion = models.ForeignKey(
        Reservacion, models.DO_NOTHING,
        related_name='paquetes_contratados'
    )
    paquete = models.ForeignKey(
        Paqueteadicional, models.DO_NOTHING,
        related_name='reservaciones_con_paquete'
    )

    class Meta:
        managed = False
        db_table = 'ReservacionPaquete'
        unique_together = (('reservacion', 'paquete'),)

    def __str__(self):
        return f'{self.paquete.nombre} en reservación #{self.reservacion_id}'