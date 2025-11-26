import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { Hotel, Wifi, Coffee, Car, Star, MapPin } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary via-hotel-brown to-accent opacity-90"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay"
          }}
        />
        <div className="relative z-10 text-center text-white px-4 animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 drop-shadow-lg">
            Bem-vindo ao Hotel Horizonte
          </h1>
          <p className="text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Onde luxo e conforto se encontram para criar experiências inesquecíveis
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/quartos")}
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-elegant"
          >
            Explore Nossos Quartos
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            Comodidades Exclusivas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Wifi, title: "Wi-Fi Gratuito", desc: "Internet de alta velocidade em todo o hotel" },
              { icon: Coffee, title: "Café da Manhã", desc: "Buffet completo incluído na diária" },
              { icon: Car, title: "Estacionamento", desc: "Vagas privativas para hóspedes" },
              { icon: Hotel, title: "Room Service", desc: "Disponível 24 horas por dia" },
            ].map((feature, idx) => (
              <Card key={idx} className="text-center hover:shadow-hover transition-all duration-300 border-border">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            O que nossos hóspedes dizem
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                review: "Experiência incrível! Quartos espaçosos e equipe muito atenciosa.",
                rating: 5,
              },
              {
                name: "João Santos",
                review: "Localização perfeita e café da manhã excelente. Recomendo!",
                rating: 5,
              },
              {
                name: "Ana Costa",
                review: "Hotel maravilhoso! Voltarei com certeza. Vale cada centavo.",
                rating: 5,
              },
            ].map((review, idx) => (
              <Card key={idx} className="hover:shadow-hover transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{review.review}"</p>
                  <p className="font-semibold text-foreground">- {review.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <MapPin className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl font-bold mb-4 text-foreground">Localização Privilegiada</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rua das Flores, 1000 - Centro, São Paulo - SP
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Situado no coração da cidade, o Hotel Horizonte oferece fácil acesso aos principais 
            pontos turísticos, centros comerciais e áreas empresariais. Perfeito para viagens 
            de negócios ou lazer.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Hotel Horizonte. Todos os direitos reservados.</p>
          <p className="mt-2">Contato: (11) 1234-5678 | contato@hotelhorizonte.com.br</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;