import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { cn } from "@/lib/utils";

const reservaSchema = z.object({
  numHospedes: z.number().min(1, "Número de hóspedes deve ser no mínimo 1").max(10, "Máximo 10 hóspedes"),
  observacoes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
});

const Reservar = () => {
  const { quartoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quarto, setQuarto] = useState<any>(null);
  const [dataCheckin, setDataCheckin] = useState<Date>();
  const [dataCheckout, setDataCheckout] = useState<Date>();
  const [numHospedes, setNumHospedes] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (quartoId) {
      fetchQuarto();
    }
  }, [quartoId, user, navigate]);

  const fetchQuarto = async () => {
    try {
      const { data, error } = await supabase
        .from("quartos")
        .select("*")
        .eq("id", quartoId)
        .single();

      if (error) throw error;
      setQuarto(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar quarto",
        description: error.message,
        variant: "destructive",
      });
      navigate("/quartos");
    }
  };

  const calcularValorTotal = () => {
    if (!dataCheckin || !dataCheckout || !quarto) return 0;
    const dias = differenceInDays(dataCheckout, dataCheckin);
    return dias * quarto.preco_diaria;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!dataCheckin || !dataCheckout) {
      toast({
        title: "Erro",
        description: "Selecione as datas de check-in e check-out",
        variant: "destructive",
      });
      return;
    }

    if (dataCheckout <= dataCheckin) {
      toast({
        title: "Erro",
        description: "Data de check-out deve ser posterior ao check-in",
        variant: "destructive",
      });
      return;
    }

    try {
      const validated = reservaSchema.parse({
        numHospedes,
        observacoes: observacoes || undefined,
      });

      setLoading(true);

      const valorTotal = calcularValorTotal();

      const { error } = await supabase.from("reservas").insert({
        user_id: user?.id,
        quarto_id: quartoId,
        data_checkin: format(dataCheckin, "yyyy-MM-dd"),
        data_checkout: format(dataCheckout, "yyyy-MM-dd"),
        num_hospedes: validated.numHospedes,
        valor_total: valorTotal,
        observacoes: validated.observacoes || null,
        status: "pendente",
      });

      if (error) throw error;

      toast({
        title: "Reserva criada com sucesso!",
        description: "Sua reserva foi registrada e está pendente de confirmação",
      });

      navigate("/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast({
          title: "Erro ao criar reserva",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!quarto) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-3xl">Fazer Reserva</CardTitle>
              <CardDescription>
                Quarto {quarto.numero} - {quarto.tipo}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Check-in</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dataCheckin && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataCheckin ? format(dataCheckin, "PPP", { locale: ptBR }) : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dataCheckin}
                          onSelect={setDataCheckin}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Check-out</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dataCheckout && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataCheckout ? format(dataCheckout, "PPP", { locale: ptBR }) : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dataCheckout}
                          onSelect={setDataCheckout}
                          disabled={(date) => !dataCheckin || date <= dataCheckin}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospedes">Número de Hóspedes</Label>
                  <Input
                    id="hospedes"
                    type="number"
                    min="1"
                    max={quarto.capacidade}
                    value={numHospedes}
                    onChange={(e) => setNumHospedes(parseInt(e.target.value))}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Capacidade máxima: {quarto.capacidade} pessoa{quarto.capacidade > 1 ? "s" : ""}
                  </p>
                  {errors.numHospedes && <p className="text-sm text-destructive">{errors.numHospedes}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (Opcional)</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Alguma solicitação especial?"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    maxLength={500}
                  />
                  {errors.observacoes && <p className="text-sm text-destructive">{errors.observacoes}</p>}
                </div>

                {dataCheckin && dataCheckout && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diárias:</span>
                          <span className="font-medium">
                            {differenceInDays(dataCheckout, dataCheckin)} noite
                            {differenceInDays(dataCheckout, dataCheckin) > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor por diária:</span>
                          <span className="font-medium">R$ {quarto.preco_diaria.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary">R$ {calcularValorTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/quartos")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Reservando..." : "Confirmar Reserva"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reservar;