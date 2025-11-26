import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const uploadSchema = z.object({
  tipoDocumento: z.string().min(1, "Selecione o tipo de documento"),
  arquivo: z.custom<File>((file) => file instanceof File, "Selecione um arquivo")
    .refine((file) => file.size <= MAX_FILE_SIZE, "Arquivo deve ter no máximo 5MB")
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), "Tipo de arquivo não permitido. Use PDF, JPG ou PNG"),
});

interface Documento {
  id: string;
  nome_arquivo: string;
  tipo_documento: string;
  arquivo_url: string;
  created_at: string;
}

const UploadDocumento = () => {
  const { reservaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchDocumentos();
  }, [user, navigate, reservaId]);

  const fetchDocumentos = async () => {
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select("*")
        .eq("reserva_id", reservaId)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar documentos:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!arquivo) {
      setErrors({ arquivo: "Selecione um arquivo" });
      return;
    }

    try {
      const validated = uploadSchema.parse({
        tipoDocumento,
        arquivo,
      });

      setLoading(true);

      // Upload file to storage
      const fileExt = validated.arquivo.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(fileName, validated.arquivo);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName);

      // Save document record to database
      const { error: dbError } = await supabase.from("documentos").insert({
        user_id: user?.id,
        reserva_id: reservaId,
        nome_arquivo: validated.arquivo.name,
        tipo_documento: validated.tipoDocumento,
        arquivo_url: publicUrl,
      });

      if (dbError) throw dbError;

      toast({
        title: "Documento enviado com sucesso!",
        description: "O documento foi salvo na sua reserva",
      });

      // Reset form
      setArquivo(null);
      setTipoDocumento("");
      if (e.target instanceof HTMLFormElement) {
        e.target.reset();
      }
      
      // Refresh documents list
      fetchDocumentos();
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
          title: "Erro ao enviar documento",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split("/");
      const filePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documentos")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("documentos")
        .delete()
        .eq("id", docId);

      if (dbError) throw dbError;

      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso",
      });

      fetchDocumentos();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir documento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Enviar Documentos</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Novo Documento</CardTitle>
                <CardDescription>
                  Envie documentos relacionados à sua reserva (PDF, JPG ou PNG, máx. 5MB)
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Documento</Label>
                    <Select value={tipoDocumento} onValueChange={setTipoDocumento} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="identidade">Identidade (RG/CNH)</SelectItem>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="comprovante_residencia">Comprovante de Residência</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipoDocumento && <p className="text-sm text-destructive">{errors.tipoDocumento}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arquivo">Arquivo</Label>
                    <Input
                      id="arquivo"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      required
                    />
                    {errors.arquivo && <p className="text-sm text-destructive">{errors.arquivo}</p>}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? "Enviando..." : "Enviar Documento"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="w-full"
                  >
                    Voltar para Reservas
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Documentos Enviados</CardTitle>
                <CardDescription>
                  Seus documentos salvos nesta reserva
                </CardDescription>
              </CardHeader>

              <CardContent>
                {documentos.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum documento enviado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentos.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.nome_arquivo}</p>
                            <p className="text-xs text-muted-foreground">{doc.tipo_documento}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.arquivo_url, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(doc.id, doc.arquivo_url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumento;