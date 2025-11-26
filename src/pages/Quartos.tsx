import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, Bed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Quarto {
  id: string;
  numero: string;
  tipo: string;
  descricao: string;
  capacidade: number;
  preco_diaria: number;
  imagem_url: string | null;
  disponivel: boolean;
}

const Quartos = () => {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuartos();
  }, []);

  const fetchQuartos = async () => {
    try {
      const { data, error } = await supabase
        .from("quartos")
        .select("*")
        .eq("disponivel", true)
        .order("preco_diaria", { ascending: true });

      if (error) throw error;
      setQuartos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar quartos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = (quartoId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para fazer uma reserva",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    navigate(`/reservar/${quartoId}`);
  };

  const getRoomImage = (tipo: string) => {
    const images: Record<string, string> = {
      "Standard": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070",
      "Deluxe": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070",
      "Suíte Premium": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070",
    };
    return images[tipo] || images["Standard"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Carregando quartos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4 text-foreground">Nossos Quartos</h1>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Escolha o quarto perfeito para sua estadia. Todos equipados com as melhores comodidades.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quartos.map((quarto) => (
              <Card key={quarto.id} className="overflow-hidden hover:shadow-hover transition-all duration-300 group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={quarto.imagem_url || getRoomImage(quarto.tipo)}
                    alt={`Quarto ${quarto.numero}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                    {quarto.tipo}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-foreground">Quarto {quarto.numero}</span>
                    <span className="text-primary font-bold">
                      R$ {quarto.preco_diaria.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4">{quarto.descricao}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{quarto.capacidade} pessoas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>Cama confortável</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleReservar(quarto.id)}
                  >
                    Reservar Agora
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Quartos;