from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from upload.models import Ticket, TicketUpdate
from upload.Serializers.TicketSerializer import TicketSerializer, TicketUpdateSerializer
from django.contrib.auth.models import User

class TicketListCreate(generics.ListCreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        serializer.save()

class TicketRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class TicketAssign(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ticket = generics.get_object_or_404(Ticket, pk=pk)
        user_id = request.data.get('user_id')
        if user_id:
            user = generics.get_object_or_404(User, pk=user_id)
            ticket.assigned_to = user
            ticket.save()
            serializer = TicketSerializer(ticket, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'No user_id provided'}, status=status.HTTP_400_BAD_REQUEST)

class TicketAddUpdate(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ticket = generics.get_object_or_404(Ticket, pk=pk)
        serializer = TicketUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            update = serializer.save(ticket=ticket, user=request.user)
            return Response(TicketUpdateSerializer(update, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class TicketListByStatus(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        status = self.kwargs['status'].upper()
        return Ticket.objects.filter(status=status)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class TicketListByPriority(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        priority = self.kwargs['priority'].upper()
        return Ticket.objects.filter(priority=priority)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class TicketAssignedToMe(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(assigned_to=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class TicketSearch(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        return Ticket.objects.filter(title__icontains=query) | Ticket.objects.filter(description__icontains=query)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class TicketUpdateListCreate(generics.ListCreateAPIView):
    queryset = TicketUpdate.objects.all()
    serializer_class = TicketUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketUpdateRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = TicketUpdate.objects.all()
    serializer_class = TicketUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context