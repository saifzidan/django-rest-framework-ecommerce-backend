import sys
sys.path.append("..")
from rest_framework import generics , mixins
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Product
from .serializers import ProductSerializer
from api.mixins import StaffEditorPermissonMixixn , UserQuerySetMixin
class ProductListCreateAPIView(UserQuerySetMixin , StaffEditorPermissonMixixn , generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    def perform_create(self, serializer):
        #email = serializer.validated_data.pop('email')
        #print(email)
        title = serializer.validated_data.get('title')
        content = serializer.validated_data.get('content')
        if content is None:
            content = title
        serializer.save(user = self.request.user , content=content)
#    def get_queryset(self , *args, **kwargs):
#        qs = super().get_queryset(*args, **kwargs)
#        request = self.request
#        user = request.user
#        if not user.is_authenticated:
#            return Product.objects.none()
#        request = self.request
#        #print(request.user)
#        return qs.filter(user = request.user)
product_list_create_view = ProductListCreateAPIView.as_view()
class ProductDetailAPIView(UserQuerySetMixin , generics.RetrieveAPIView , StaffEditorPermissonMixixn):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
product_detail_view = ProductDetailAPIView.as_view()
class ProductUpdateAPIView(UserQuerySetMixin , generics.UpdateAPIView , StaffEditorPermissonMixixn):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'pk'
    def perform_update(self, serializer):
        instance = serializer.save()
        if not instance.content:
            instance.content = instance.title
product_update_view = ProductUpdateAPIView.as_view()
class ProductDestroyAPIView(UserQuerySetMixin , generics.DestroyAPIView , StaffEditorPermissonMixixn):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'pk'
    def perform_destroy(self, instance):
        return super().perform_destroy(instance)
product_destroy_view = ProductDestroyAPIView.as_view()
""" class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser , IsStaffEditorPermission]
product_list_view = ProductListAPIView.as_view() """
class ProductMixinView(UserQuerySetMixin , mixins.ListModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin ,mixins.RetrieveModelMixin ,generics.GenericAPIView , StaffEditorPermissonMixixn):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'pk'
    def get(self , request , *args, **kwargs):
        pk = kwargs.get("pk")
        if pk is not None:
            return self.retrieve(request , *args , **kwargs)
    def post(self , request , *args, **kwargs):
        return self.create(request , *args, **kwargs)
    def perform_create(self, serializer):
        title = serializer.validated_data.get('title')
        content = serializer.validated_data.get('content')
        if content is None:
            content = "this is a single view doing cool stuff"
        serializer.save(content=content)
product_mixin_view = ProductMixinView.as_view()
@api_view(['GET' , 'POST'])
def product_alt_view(request , pk=None , *args , **kwargs):
    method = request.method
    serializer = ProductSerializer(data=request.data)
    if method == "GET":
        if pk is not None:
            obj = get_object_or_404(Product , pk = pk)
            data = ProductSerializer(obj , many = False).data
            return Response(data)
        queryset = Product.objects.all()
        data = ProductSerializer(queryset , many = True).data
        return Response(data)
    if method == "POST":
        if serializer.is_valid(raise_exception=True):
            title = serializer.validated_data.get('title')
            content = serializer.validated_data.get('content')
            if content is None:
                content = title
            serializer.save(content=content)
            return Response(serializer.data)
    return Response({"invalid" : "not good data"} , status=400)