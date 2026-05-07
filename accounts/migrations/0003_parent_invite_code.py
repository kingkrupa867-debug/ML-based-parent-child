from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuser_surname_family_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='children', to='accounts.customuser'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='invite_code',
            field=models.CharField(blank=True, editable=False, max_length=12, null=True, unique=True),
        ),
    ]
