# Generated by Django 5.1.3 on 2024-12-13 19:19

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0009_alter_game_date_start_alter_game_time_start'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='time_start',
            field=models.TimeField(default=datetime.time(19, 19, 48, 49466), null=True),
        ),
    ]