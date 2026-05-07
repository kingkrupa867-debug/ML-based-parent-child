from django.db import migrations, models
from django.utils.text import slugify


def populate_family_id(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    for user in CustomUser.objects.all():
        surname = (getattr(user, 'surname', '') or user.username).strip()
        user.surname = surname
        user.family_id = slugify(surname).replace('-', '') or surname.lower()
        user.save(update_fields=['surname', 'family_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='surname',
            field=models.CharField(default='family', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customuser',
            name='family_id',
            field=models.CharField(db_index=True, default='family', editable=False, max_length=120),
            preserve_default=False,
        ),
        migrations.RunPython(populate_family_id, migrations.RunPython.noop),
    ]
