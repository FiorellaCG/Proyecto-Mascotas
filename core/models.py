from django.db import models

# Este archivo contiene únicamente las tablas internas que Django
# generó al correr migrate. No agregar modelos del negocio aquí.


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150, db_collation='Modern_Spanish_CI_AI')

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthPermission(models.Model):
    name = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AI')
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AI')

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128, db_collation='Modern_Spanish_CI_AI')
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150, db_collation='Modern_Spanish_CI_AI')
    first_name = models.CharField(max_length=150, db_collation='Modern_Spanish_CI_AI')
    last_name = models.CharField(max_length=150, db_collation='Modern_Spanish_CI_AI')
    email = models.CharField(max_length=254, db_collation='Modern_Spanish_CI_AI')
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    object_repr = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AI')
    action_flag = models.SmallIntegerField()
    change_message = models.TextField(db_collation='Modern_Spanish_CI_AI')
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AI')
    model = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AI')

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AI')
    name = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AI')
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40, db_collation='Modern_Spanish_CI_AI')
    session_data = models.TextField(db_collation='Modern_Spanish_CI_AI')
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'