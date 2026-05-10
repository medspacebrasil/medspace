import type { Metadata } from "next"
import { LegalPage } from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Termos de Uso — MedSpace",
  description:
    "Regras, responsabilidades e condições para uso da plataforma MedSpace.",
}

export default function TermosDeUsoPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      subtitle="Plataforma digital de anúncios e divulgação de oportunidades voltadas à área da saúde."
      lastUpdated="09/05/2026"
    >
      <h2>1. Apresentação</h2>
      <p>
        Bem-vindo à MedSpace. A MedSpace é uma plataforma digital de anúncios
        e divulgação de oportunidades voltadas à área da saúde, operada por{" "}
        <strong>MEDSPACE PUBLICIDADE LTDA</strong>, inscrita no CNPJ sob nº{" "}
        <strong>66.632.755/0001-17</strong>.
      </p>
      <p>A plataforma é destinada à publicação e consulta de anúncios relacionados a:</p>
      <ul>
        <li>espaços profissionais;</li>
        <li>períodos disponíveis;</li>
        <li>estruturas médicas;</li>
        <li>equipamentos;</li>
        <li>cursos;</li>
        <li>mentorias;</li>
        <li>eventos;</li>
        <li>serviços e oportunidades profissionais relacionadas ao setor da saúde.</li>
      </ul>
      <p>
        A MedSpace atua exclusivamente como ambiente digital de divulgação e
        conexão entre usuários, não realizando locação, sublocação, reserva,
        intermediação imobiliária, intermediação financeira, prestação de
        serviços médicos ou participação direta nas negociações realizadas
        entre usuários.
      </p>
      <p>Toda negociação ocorre diretamente entre os usuários da plataforma.</p>

      <h2>2. Aceitação dos Termos</h2>
      <p>
        Ao acessar, navegar, cadastrar-se ou utilizar a plataforma MedSpace, o
        usuário declara ter lido, compreendido e aceitado integralmente estes
        Termos de Uso e a Política de Privacidade da plataforma.
      </p>
      <p>
        Caso não concorde com qualquer disposição destes Termos, o usuário
        deverá interromper imediatamente a utilização da plataforma.
      </p>

      <h2>3. Definições</h2>
      <p>Para fins destes Termos, consideram-se:</p>
      <ul>
        <li>
          <strong>Plataforma</strong>: ambiente digital operado pela MedSpace
          destinado à divulgação de anúncios e conexão entre usuários.
        </li>
        <li>
          <strong>Usuário</strong>: toda pessoa física ou jurídica que acessa
          ou utiliza a plataforma.
        </li>
        <li>
          <strong>Anunciante</strong>: usuário responsável pela publicação de
          anúncios na plataforma.
        </li>
        <li>
          <strong>Profissional da Saúde</strong>: usuário que atua ou pretende
          atuar profissionalmente na área da saúde, devidamente habilitado
          quando exigido pela legislação ou conselho profissional competente.
        </li>
        <li>
          <strong>Anúncio</strong>: toda informação, imagem, texto, oferta ou
          conteúdo publicado pelos usuários na plataforma.
        </li>
      </ul>

      <h2>4. Objeto da plataforma</h2>
      <p>A MedSpace disponibiliza exclusivamente um ambiente digital para:</p>
      <ul>
        <li>publicação de anúncios;</li>
        <li>divulgação de oportunidades;</li>
        <li>organização de informações;</li>
        <li>contato entre usuários.</li>
      </ul>
      <p>
        <strong>A MedSpace NÃO:</strong>
      </p>
      <ul>
        <li>realiza reservas;</li>
        <li>realiza locações;</li>
        <li>realiza sublocações;</li>
        <li>participa de negociações;</li>
        <li>administra agendas;</li>
        <li>processa pagamentos;</li>
        <li>recebe valores em nome de usuários;</li>
        <li>garante fechamento de negócios;</li>
        <li>garante disponibilidade de espaços;</li>
        <li>garante funcionamento de equipamentos;</li>
        <li>presta serviços médicos;</li>
        <li>presta serviços educacionais;</li>
        <li>atua como corretora ou imobiliária.</li>
      </ul>
      <p>
        Toda contratação, negociação, pagamento ou relação comercial ocorrerá
        diretamente entre os usuários envolvidos.
      </p>

      <h2>5. Cadastro de usuários</h2>
      <p>O uso de determinadas funcionalidades poderá exigir cadastro prévio.</p>
      <p>O usuário declara que:</p>
      <ul>
        <li>possui capacidade legal;</li>
        <li>fornecerá informações verdadeiras, atualizadas e completas;</li>
        <li>é responsável pelas informações cadastradas;</li>
        <li>manterá a confidencialidade de sua senha;</li>
        <li>responderá integralmente por toda atividade realizada em sua conta.</li>
      </ul>
      <p>A MedSpace poderá suspender, limitar ou excluir contas em caso de:</p>
      <ul>
        <li>fraude;</li>
        <li>informações falsas;</li>
        <li>uso indevido;</li>
        <li>violação destes Termos;</li>
        <li>atividades ilegais;</li>
        <li>comportamento abusivo;</li>
        <li>tentativa de violação da plataforma.</li>
      </ul>

      <h2>6. Uso por menores</h2>
      <p>
        A plataforma é destinada exclusivamente a usuários maiores de 18 anos
        e legalmente capazes. Menores de idade somente poderão utilizar a
        plataforma mediante representação ou assistência legal, conforme
        legislação aplicável.
      </p>

      <h2>7. Responsabilidade dos usuários</h2>
      <p>Os usuários são integralmente responsáveis:</p>
      <ul>
        <li>pelos conteúdos publicados;</li>
        <li>pelas informações divulgadas;</li>
        <li>pelas negociações realizadas;</li>
        <li>pelas obrigações assumidas perante terceiros;</li>
        <li>pela regularidade de suas atividades profissionais;</li>
        <li>
          pela regularidade sanitária, técnica e legal dos espaços, equipamentos
          e serviços anunciados.
        </li>
      </ul>
      <p>
        Os usuários declaram que todas as informações fornecidas são
        verdadeiras, legítimas e atualizadas.
      </p>

      <h2>8. Responsabilidade profissional</h2>
      <p>
        Os profissionais cadastrados declaram possuir habilitação legal e
        registro válido perante os respectivos conselhos profissionais, quando
        aplicável.
      </p>
      <p>
        A MedSpace não realiza validação prévia de registros profissionais,
        licenças, alvarás, certificações ou autorizações legais dos usuários.
      </p>
      <p>
        Toda responsabilidade pelo exercício profissional é exclusiva do
        respectivo usuário.
      </p>

      <h2>9. Regularidade dos anúncios</h2>
      <p>Os anunciantes são exclusivamente responsáveis:</p>
      <ul>
        <li>pela veracidade dos anúncios;</li>
        <li>pelas condições dos espaços;</li>
        <li>pelas condições dos equipamentos;</li>
        <li>pelas licenças necessárias;</li>
        <li>pelas condições sanitárias;</li>
        <li>pelas autorizações legais;</li>
        <li>pelas informações divulgadas.</li>
      </ul>
      <p>
        A MedSpace não realiza auditoria, vistoria, inspeção ou validação
        técnica dos anúncios publicados.
      </p>

      <h2>10. Licença de uso de conteúdo</h2>
      <p>
        Ao publicar anúncios, imagens, textos, logotipos, vídeos, descrições
        ou quaisquer conteúdos na plataforma, o usuário concede à MedSpace
        autorização gratuita, não exclusiva e limitada às finalidades de
        funcionamento, divulgação e promoção da plataforma para utilizar,
        reproduzir, exibir, armazenar, divulgar e disponibilizar tais
        conteúdos dentro da própria plataforma e em materiais institucionais,
        promocionais e publicitários relacionados à MedSpace.
      </p>
      <p>
        O usuário declara possuir todos os direitos, autorizações e permissões
        necessários sobre os conteúdos publicados, responsabilizando-se
        integralmente por eventuais violações de direitos autorais,
        propriedade intelectual, imagem ou direitos de terceiros.
      </p>
      <p>
        A MedSpace poderá utilizar imagens, títulos e descrições dos anúncios
        para fins de divulgação da plataforma em campanhas institucionais,
        redes sociais, mecanismos de busca e materiais promocionais
        relacionados à MedSpace.
      </p>

      <h2>11. Cursos, mentorias e conteúdos educacionais</h2>
      <p>
        A plataforma poderá permitir a divulgação de cursos, mentorias,
        treinamentos, eventos e conteúdos educacionais relacionados à área da
        saúde.
      </p>
      <p>A MedSpace não garante:</p>
      <ul>
        <li>qualidade dos conteúdos;</li>
        <li>resultados prometidos;</li>
        <li>veracidade das informações;</li>
        <li>qualificação dos organizadores;</li>
        <li>reconhecimento institucional;</li>
        <li>certificações;</li>
        <li>regularidade pedagógica ou profissional.</li>
      </ul>
      <p>
        Toda responsabilidade pelos conteúdos anunciados é exclusiva dos
        respectivos anunciantes.
      </p>

      <h2>12. Ausência de garantia de resultados</h2>
      <p>
        A MedSpace não garante qualquer resultado financeiro, profissional,
        comercial, acadêmico ou operacional decorrente da utilização da
        plataforma, dos anúncios nela divulgados ou das relações estabelecidas
        entre os usuários.
      </p>
      <p>A MedSpace não garante:</p>
      <ul>
        <li>obtenção de clientes;</li>
        <li>fechamento de negócios;</li>
        <li>ocupação de espaços;</li>
        <li>retorno financeiro;</li>
        <li>contratação profissional;</li>
        <li>resultados de cursos ou mentorias;</li>
        <li>crescimento profissional;</li>
        <li>disponibilidade de oportunidades.</li>
      </ul>
      <p>
        Toda decisão tomada pelos usuários com base em anúncios ou informações
        divulgadas na plataforma será de exclusiva responsabilidade dos
        próprios usuários.
      </p>

      <h2>13. Negociações entre usuários</h2>
      <p>A MedSpace não participa das negociações realizadas entre usuários.</p>
      <p>
        Toda negociação, contratação, definição de valores, condições
        comerciais, utilização de espaços, aquisição de equipamentos,
        participação em cursos ou qualquer outra relação jurídica ocorrerá
        exclusivamente entre os usuários envolvidos.
      </p>
      <p>
        A MedSpace não possui responsabilidade por comunicações, negociações,
        pagamentos, arquivos, links, documentos ou informações compartilhadas
        diretamente entre usuários por meios externos à plataforma, incluindo
        aplicativos de mensagens, e-mails, redes sociais ou sites de terceiros.
      </p>
      <p>A MedSpace não integra qualquer contrato firmado entre usuários.</p>

      <h2>14. Pagamentos</h2>
      <p>Atualmente, a MedSpace poderá disponibilizar anúncios gratuitos.</p>
      <p>
        A MedSpace poderá, a qualquer momento e mediante aviso prévio aos
        usuários, implementar planos pagos, cobranças por anúncios,
        funcionalidades premium ou serviços adicionais.
      </p>
      <p>
        Os usuários serão previamente comunicados sobre quaisquer alterações
        relacionadas à cobrança, podendo optar pela manutenção ou exclusão de
        seus anúncios e contas.
      </p>
      <p>
        A MedSpace não realiza intermediação financeira entre usuários
        referente às negociações anunciadas na plataforma.
      </p>

      <h2>15. Responsabilidade tributária</h2>
      <p>
        Cada usuário será exclusivamente responsável pelo cumprimento de suas
        obrigações fiscais, tributárias, trabalhistas, previdenciárias e
        regulatórias decorrentes das atividades, serviços, negociações ou
        anúncios realizados por meio da plataforma.
      </p>
      <p>
        A MedSpace não possui responsabilidade por emissão de notas fiscais,
        recolhimento de tributos ou regularidade fiscal dos usuários.
      </p>

      <h2>16. Condutas proibidas</h2>
      <p>É proibido utilizar a plataforma para:</p>
      <ul>
        <li>práticas ilegais;</li>
        <li>fraudes;</li>
        <li>anúncios enganosos;</li>
        <li>publicidade ilícita;</li>
        <li>captação irregular de pacientes;</li>
        <li>exercício ilegal da profissão;</li>
        <li>divulgação de informações falsas;</li>
        <li>comercialização proibida por lei;</li>
        <li>violação de direitos de terceiros;</li>
        <li>envio de spam;</li>
        <li>disseminação de vírus ou códigos maliciosos;</li>
        <li>tentativa de acesso indevido à plataforma;</li>
        <li>utilização automatizada sem autorização;</li>
        <li>reprodução indevida do conteúdo da plataforma.</li>
      </ul>

      <h2>17. Remoção de anúncios</h2>
      <p>
        A MedSpace poderá remover, limitar, suspender ou ocultar anúncios a
        qualquer momento, independentemente de aviso prévio, quando identificar:
      </p>
      <ul>
        <li>indícios de fraude;</li>
        <li>informações falsas;</li>
        <li>conteúdo ilegal;</li>
        <li>violação destes Termos;</li>
        <li>risco à plataforma;</li>
        <li>denúncias fundamentadas;</li>
        <li>violação de direitos de terceiros;</li>
        <li>incompatibilidade com a finalidade da plataforma.</li>
      </ul>
      <p>
        A MedSpace não será responsável por quaisquer perdas decorrentes da
        remoção de anúncios ou conteúdos publicados pelos usuários.
      </p>

      <h2>18. Limitação de responsabilidade</h2>
      <p>
        A MedSpace atua exclusivamente como plataforma digital de divulgação
        de anúncios.
      </p>
      <p>A MedSpace não garante:</p>
      <ul>
        <li>veracidade dos anúncios;</li>
        <li>disponibilidade dos espaços;</li>
        <li>funcionamento de equipamentos;</li>
        <li>regularidade sanitária;</li>
        <li>regularidade profissional;</li>
        <li>qualidade dos serviços;</li>
        <li>resultados comerciais;</li>
        <li>realização de negócios;</li>
        <li>conduta dos usuários.</li>
      </ul>
      <p>A MedSpace não será responsável por:</p>
      <ul>
        <li>danos materiais;</li>
        <li>danos morais;</li>
        <li>lucros cessantes;</li>
        <li>perdas financeiras;</li>
        <li>conflitos entre usuários;</li>
        <li>cancelamentos;</li>
        <li>falhas operacionais;</li>
        <li>problemas sanitários;</li>
        <li>atendimentos médicos;</li>
        <li>procedimentos profissionais;</li>
        <li>cursos anunciados;</li>
        <li>mentorias anunciadas;</li>
        <li>conteúdos divulgados pelos usuários.</li>
      </ul>
      <p>
        Toda responsabilidade decorrente das relações estabelecidas na
        plataforma será exclusiva dos respectivos usuários envolvidos.
      </p>

      <h2>19. Exclusão de responsabilidade médica</h2>
      <p>
        A MedSpace não presta serviços médicos, hospitalares, laboratoriais,
        clínicos, diagnósticos, terapêuticos ou assistenciais.
      </p>
      <p>A plataforma não realiza:</p>
      <ul>
        <li>encaminhamento médico;</li>
        <li>telemedicina;</li>
        <li>aconselhamento clínico;</li>
        <li>supervisão profissional;</li>
        <li>triagem;</li>
        <li>recomendações médicas;</li>
        <li>validação de condutas profissionais.</li>
      </ul>
      <p>
        Toda responsabilidade pelos atendimentos, prescrições, diagnósticos,
        procedimentos e condutas profissionais é exclusiva dos respectivos
        profissionais da saúde.
      </p>

      <h2>20. Propriedade intelectual</h2>
      <p>Todos os direitos relacionados à MedSpace, incluindo:</p>
      <ul>
        <li>marca;</li>
        <li>identidade visual;</li>
        <li>logotipo;</li>
        <li>layout;</li>
        <li>software;</li>
        <li>banco de dados;</li>
        <li>funcionalidades;</li>
        <li>conteúdos institucionais;</li>
      </ul>
      <p>são protegidos pela legislação aplicável de propriedade intelectual.</p>
      <p>
        É proibida qualquer reprodução, cópia, distribuição, engenharia
        reversa, extração de dados ou utilização sem autorização prévia da
        MedSpace.
      </p>

      <h2>21. Links externos</h2>
      <p>
        A plataforma poderá conter links para sites, redes sociais ou
        plataformas de terceiros. A MedSpace não possui responsabilidade
        sobre conteúdos, produtos, serviços ou políticas de terceiros.
      </p>

      <h2>22. Privacidade e dados pessoais</h2>
      <p>
        O tratamento de dados pessoais ocorrerá conforme a Política de
        Privacidade da MedSpace e em conformidade com a Lei Geral de Proteção
        de Dados (LGPD).
      </p>

      <h2>23. Suspensão e encerramento</h2>
      <p>
        A MedSpace poderá suspender, limitar ou encerrar contas, anúncios ou
        funcionalidades a qualquer momento em caso de:
      </p>
      <ul>
        <li>descumprimento destes Termos;</li>
        <li>risco à plataforma;</li>
        <li>atividades suspeitas;</li>
        <li>determinação legal;</li>
        <li>necessidade operacional.</li>
      </ul>

      <h2>24. Alterações dos Termos</h2>
      <p>A MedSpace poderá alterar estes Termos a qualquer momento.</p>
      <p>As alterações entrarão em vigor após publicação na plataforma.</p>
      <p>
        O uso continuado da plataforma após as alterações será interpretado
        como concordância com os novos Termos.
      </p>

      <h2>25. Disponibilidade da plataforma</h2>
      <p>
        A MedSpace envidará esforços razoáveis para manter a plataforma
        disponível e funcional, porém não garante funcionamento ininterrupto,
        livre de falhas, erros, instabilidades ou indisponibilidades.
      </p>
      <p>A plataforma poderá passar por:</p>
      <ul>
        <li>manutenções;</li>
        <li>atualizações;</li>
        <li>correções;</li>
        <li>interrupções temporárias;</li>
        <li>limitações técnicas;</li>
        <li>falhas de terceiros;</li>
        <li>indisponibilidades operacionais</li>
      </ul>
      <p>sem necessidade de aviso prévio.</p>
      <p>
        A MedSpace não será responsável por danos, prejuízos, perda de dados,
        perda de oportunidades, lucros cessantes ou quaisquer impactos
        decorrentes de falhas técnicas, interrupções, indisponibilidade da
        plataforma ou problemas relacionados a serviços de terceiros.
      </p>

      <h2>26. Disposições gerais</h2>
      <p>
        A MedSpace poderá alterar, suspender ou descontinuar funcionalidades
        da plataforma a qualquer momento, sem necessidade de aviso prévio.
      </p>
      <p>
        A eventual tolerância quanto ao descumprimento de qualquer disposição
        destes Termos não implicará renúncia de direitos.
      </p>
      <p>
        A MedSpace poderá utilizar ferramentas automatizadas, inteligência
        artificial, algoritmos e recursos tecnológicos para organização,
        categorização, moderação, otimização e exibição de conteúdos e
        anúncios na plataforma.
      </p>
      <p>
        Caso qualquer cláusula seja considerada inválida, as demais
        permanecerão plenamente válidas.
      </p>

      <h2>27. Foro</h2>
      <p>
        Fica eleito o foro da Comarca de Brasília/DF para dirimir quaisquer
        controvérsias relacionadas a estes Termos de Uso, com exclusão de
        qualquer outro foro.
      </p>
    </LegalPage>
  )
}
