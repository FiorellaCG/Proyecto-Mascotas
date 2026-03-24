from django.db import models


class Rol(models.Model):
    rol_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50, db_collation='Modern_Spanish_CI_AI')
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'Rol'

    def __str__(self):
        return self.nombre


class Usuario(models.Model):
    usuario_id = models.AutoField(primary_key=True)
    rol = models.ForeignKey(Rol, models.DO_NOTHING, related_name='usuarios')
    nombre = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AI')
    apellidos = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AI')
    cedula = models.CharField(unique=True, max_length=20, db_collation='Modern_Spanish_CI_AI')
    correo = models.CharField(unique=True, max_length=150, db_collation='Modern_Spanish_CI_AI')
    telefono = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    password = models.CharField(max_length=256, db_collation='Modern_Spanish_CI_AI')
    activo = models.BooleanField()
    fecha_registro = models.DateTimeField()
    ultimo_acceso = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Usuario'

    def __str__(self):
        return f'{self.nombre} {self.apellidos}'