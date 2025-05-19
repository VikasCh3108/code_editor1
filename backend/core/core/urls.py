"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.contrib import admin
from executor.views import ExecuteCodeView
from django.views.generic import TemplateView
from django.views.static import serve as static_serve
import os
from django.conf import settings
from django.http import HttpResponse

# Custom view to serve React index.html
class FrontendAppView(TemplateView):
    def get(self, request, *args, **kwargs):
        try:
            with open(os.path.join(settings.BASE_DIR, 'static', 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse(
                "This build file was not found. Please build the frontend.", status=501,
            )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/execute/', ExecuteCodeView.as_view(), name='execute-code'),
    re_path(r'^(?!api/|admin/).*$', FrontendAppView.as_view()),
]
