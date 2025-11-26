import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Hotel, Users, CalendarCheck, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({ quartos: 0, reservas: 0, usuarios: 0 });
  const [quartos, setQuartos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [editingQuarto, setEditingQuarto] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      return;
    }
    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [quartosRes, reservasRes, profilesRes] = await Promise.all([
        supabase.from("quartos").select("*"),
        supabase.from("reservas").select("*, quartos(*), profiles(*)"),
        supabase.from("profiles").select("id"),
      ]);

      setQuartos(quartosRes.data || []);
      setReservas(reservasRes.data || []);
      setStats({
        quartos: quartosRes.data?.length || 0,
        reservas: reservasRes.data?.length || 0,
        usuarios: profilesRes.data?.length || 0,
      });
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleDeleteQuarto = async (id: string) => {
    try {
      const { error } = await supabase.from("quartos").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Quarto excluído com sucesso" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro ao excluir quarto", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveQuarto = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        numero: formData.get("numero") as string,
        tipo: formData.get("tipo") as string,
        descricao: formData.get("descricao") as string,
        capacidade: parseInt(formData.get("capacidade") as string),
        preco_diaria: parseFloat(formData.get("preco_diaria") as string),
        disponivel: formData.get("disponivel") === "true",
      };

      if (editingQuarto) {
        const { error } = await supabase
          .from("quartos")
          .update(data)
          .eq("id", editingQuarto.id);
        if (error) throw error;
        toast({ title: "Quarto atualizado com sucesso" });
      } else {
        const { error } = await supabase.from("quartos").insert(data);
        if (error) throw error;
        toast({ title: "Quarto criado com sucesso" });
      }

      setEditingQuarto(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro ao salvar quarto", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReservaStatus = async (reservaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reservas")
        .update({ status: newStatus })
        .eq("id", reservaId);

      if (error) throw error;
      toast({ title: "Status atualizado com sucesso" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Painel Administrativo</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Quartos</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quartos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reservas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usuarios}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="quartos" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="quartos">Quartos</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
          </TabsList>

          {/* Quartos Tab */}
          <TabsContent value="quartos" className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingQuarto(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Quarto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingQuarto ? "Editar Quarto" : "Novo Quarto"}</DialogTitle>
                  <DialogDescription>Preencha os dados do quarto</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveQuarto} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Número</Label>
                      <Input name="numero" defaultValue={editingQuarto?.numero} required />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Input name="tipo" defaultValue={editingQuarto?.tipo} required />
                    </div>
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea name="descricao" defaultValue={editingQuarto?.descricao} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Capacidade</Label>
                      <Input
                        name="capacidade"
                        type="number"
                        defaultValue={editingQuarto?.capacidade}
                        required
                      />
                    </div>
                    <div>
                      <Label>Preço/Diária</Label>
                      <Input
                        name="preco_diaria"
                        type="number"
                        step="0.01"
                        defaultValue={editingQuarto?.preco_diaria}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select name="disponivel" defaultValue={editingQuarto?.disponivel?.toString() || "true"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Disponível</SelectItem>
                        <SelectItem value="false">Indisponível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {quartos.map((quarto) => (
                <Card key={quarto.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">
                          Quarto {quarto.numero} - {quarto.tipo}
                        </h3>
                        <p className="text-sm text-muted-foreground">{quarto.descricao}</p>
                        <p className="text-sm mt-2">
                          Capacidade: {quarto.capacidade} | R$ {quarto.preco_diaria}/noite
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuarto(quarto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteQuarto(quarto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reservas Tab */}
          <TabsContent value="reservas" className="space-y-4">
            <div className="grid gap-4">
              {reservas.map((reserva) => (
                <Card key={reserva.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">
                            {reserva.profiles?.nome_completo || "Cliente"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Quarto {reserva.quartos?.numero} - {reserva.quartos?.tipo}
                          </p>
                          <p className="text-sm mt-2">
                            Check-in: {new Date(reserva.data_checkin).toLocaleDateString("pt-BR")} |
                            Check-out: {new Date(reserva.data_checkout).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-sm">
                            Hóspedes: {reserva.num_hospedes} | Valor: R$ {reserva.valor_total}
                          </p>
                        </div>
                        <Select
                          value={reserva.status}
                          onValueChange={(value) => handleUpdateReservaStatus(reserva.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;