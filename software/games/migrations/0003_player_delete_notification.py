# Generated by Django 5.1.1 on 2025-01-07 21:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0002_notification'),
    ]

    operations = [
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.DeleteModel(
            name='Notification',
        ),
    ]
