# Generated by Django 3.2.12 on 2023-02-28 01:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sites', '0007_auto_20210916_1614'),
    ]

    operations = [
        migrations.AddField(
            model_name='site',
            name='contact_email',
            field=models.EmailField(blank=True, max_length=254, null=True, verbose_name='連絡先メール'),
        ),
        migrations.AddField(
            model_name='site',
            name='notify_contact_email',
            field=models.BooleanField(default=True, verbose_name='連絡先へのメール通知'),
        ),
        migrations.AlterField(
            model_name='site',
            name='ckanapi_url',
            field=models.URLField(verbose_name='API/一覧ファイル URL'),
        ),
    ]