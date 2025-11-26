import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Shield, Users } from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/90 to-hotel-brown/90"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay"
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">Sobre Nós</h1>
          <p className="text-2xl text-white/90">Conheça nossa história e valores</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-8 text-foreground">Nossa História</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            O Hotel Horizonte nasceu em 2010 com um sonho: criar um espaço onde cada hóspede 
            se sentisse em casa, mas com todo o conforto e luxo que merece. Localizado no coração 
            de São Paulo, rapidamente nos tornamos referência em hospitalidade.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Com uma equipe dedicada de mais de 50 profissionais, oferecemos um atendimento 
            personalizado e atencioso. Nossos 80 quartos foram cuidadosamente projetados para 
            proporcionar máximo conforto e bem-estar.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Ao longo dos anos, recebemos diversos prêmios de excelência em hospitalidade e 
            continuamos investindo em melhorias para superar as expectativas de nossos hóspedes.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Nossos Valores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Hospitalidade",
                desc: "Tratamos cada hóspede como parte da família",
              },
              {
                icon: Award,
                title: "Excelência",
                desc: "Compromisso com qualidade em cada detalhe",
              },
              {
                icon: Shield,
                title: "Segurança",
                desc: "Ambiente seguro e protegido 24 horas",
              },
              {
                icon: Users,
                title: "Comunidade",
                desc: "Valorizamos nossos colaboradores e clientes",
              },
            ].map((value, idx) => (
              <Card key={idx} className="text-center hover:shadow-hover transition-all duration-300">
                <CardContent className="pt-6">
                  <value.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Nossa Equipe</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Carlos Mendes",
                position: "Gerente Geral",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
              },
              {
                name: "Ana Paula",
                position: "Gerente de Hospitalidade",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
              },
              {
                name: "Roberto Silva",
                position: "Chef Executivo",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
              },
            ].map((member, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-hover transition-all duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-semibold mb-1 text-foreground">{member.name}</h3>
                  <p className="text-muted-foreground">{member.position}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-8 text-foreground">Entre em Contato</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Estamos sempre prontos para atendê-lo. Nossa equipe está disponível 24 horas por dia, 
            7 dias por semana.
          </p>
          <div className="space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Endereço:</strong> Rua das Flores, 1000 - Centro, São Paulo - SP</p>
            <p><strong className="text-foreground">Telefone:</strong> (11) 1234-5678</p>
            <p><strong className="text-foreground">WhatsApp:</strong> (11) 98765-4321</p>
            <p><strong className="text-foreground">E-mail:</strong> contato@hotelhorizonte.com.br</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sobre;