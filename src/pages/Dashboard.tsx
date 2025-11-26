import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Reserva {
  id: string;
  data_checkin: string;
  data_checkout: string;
  num_hospedes: number;
  valor_total: number;
  status: string;
  observacoes: string | null;
  quartos: {
    numero: string;
    tipo: string;
  };
}

const Dashboard = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchReservas();
  }, [user, navigate]);

  const fetchReservas = async () => {
    try {
      const { data, error } = await supabase
        .from("reservas")
        .select(`
          *,
          quartos (
            numero,
            tipo
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar reservas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-500",
      confirmada: "bg-green-500",
      cancelada: "bg-red-500",
      concluida: "bg-blue-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "Pendente",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      concluida: "Concluída",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Carregando suas reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Minhas Reservas</h1>
          <p className="text-muted-foreground">Gerencie suas reservas no Hotel Horizonte</p>
        </div>

        {reservas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                Você ainda não tem nenhuma reserva
              </p>
              <Button onClick={() => navigate("/quartos")}>
                Fazer Reserva
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reservas.map((reserva) => (
              <Card key={reserva.id} className="overflow-hidden hover:shadow-hover transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        Quarto {reserva.quartos.numero} - {reserva.quartos.tipo}
                      </CardTitle>
                      <CardDescription>
                        Reserva #{reserva.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(reserva.status)}>
                      {getStatusLabel(reserva.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Check-in</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reserva.data_checkin), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Check-out</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reserva.data_checkout), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Hóspedes</p>
                        <p className="text-sm text-muted-foreground">
                          {reserva.num_hospedes} pessoa{reserva.num_hospedes > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Valor Total</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {reserva.valor_total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reserva.observacoes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-foreground font-medium mb-1">Observações:</p>
                      <p className="text-sm text-muted-foreground">{reserva.observacoes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/upload-documento/${reserva.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Enviar Documento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;