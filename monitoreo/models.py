from django.db import models
from usuarios.models import Usuario
from reservaciones.models import Reservacion


class Accesomonitoreo(models.Model):
    acceso_id = models.AutoField(primary_key=True)
    reservacion = models.ForeignKey(
        Reservacion, models.DO_NOTHING,
        related_name='accesos_monitoreo'
    )
    usuario = models.ForeignKey(
        Usuario, models.DO_NOTHING,
        related_name='accesos_monitoreo_usuario'
    )
    fecha_acceso = models.DateTimeField()
    duracion_seg = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'AccesoMonitoreo'

    def __str__(self):
        return f'Acceso de {self.usuario} — {self.fecha_acceso}'