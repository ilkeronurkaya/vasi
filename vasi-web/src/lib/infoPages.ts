import type { InfoContent } from '@/components/InfoPage';

// Landing footer'dan linklenen bilgi/hukuki sayfaların 6 dilli içeriği.
// Hukuki metinler taslaktır; yayından önce hukuki gözden geçirme gerekir.
// Şirket sayfaları (hakkımızda/iletişim) makul taslak; blog/kariyer "yakında".

const UPDATED = {
  tr: 'Son güncelleme: 20 Haziran 2026',
  en: 'Last updated: 20 June 2026',
  de: 'Zuletzt aktualisiert: 20. Juni 2026',
  fr: 'Dernière mise à jour : 20 juin 2026',
  es: 'Última actualización: 20 de junio de 2026',
  ar: 'آخر تحديث: 20 يونيو 2026',
};

const gizlilik: InfoContent = {
  tr: { title: 'Gizlilik Politikası', updated: UPDATED.tr, sections: [
    { p: 'Vasi olarak gizliliğine önem veriyoruz. Bu politika, hangi kişisel verileri neden işlediğimizi ve haklarını açıklar.' },
    { h: 'Topladığımız veriler', p: 'Hesap bilgilerin (ad, e-posta, isteğe bağlı telefon), oluşturduğun mesajlar ve alıcı bilgileri, oturum ve dil tercihi. Mesaj içeriği ve alıcı iletişim bilgileri şifreli saklanır.' },
    { h: 'Kullanım amacı', p: 'Verileri yalnızca hizmeti sunmak için kullanırız: hesabını yönetmek, mesajlarını zamanı geldiğinde iletmek ve güvenliği sağlamak. Reklam veya profilleme yapmayız.' },
    { h: 'Paylaşım', p: 'Verilerini satmayız. Yalnızca hizmetin çalışması için zorunlu sağlayıcılarla (e-posta/SMS iletimi, barındırma) ve yasal zorunluluk halinde paylaşırız.' },
    { h: 'Haklarına ve iletişim', p: 'Verilerine erişme, düzeltme ve silinmesini isteme hakkın vardır. Talepler için: info@vasiapp.com' },
  ] },
  en: { title: 'Privacy Policy', updated: UPDATED.en, sections: [
    { p: 'At Vasi we care about your privacy. This policy explains what personal data we process, why, and your rights.' },
    { h: 'Data we collect', p: 'Account details (name, email, optional phone), the messages you create and recipient details, session and language preference. Message content and recipient contact details are stored encrypted.' },
    { h: 'How we use it', p: 'We use data only to provide the service: manage your account, deliver your messages when due, and keep things secure. We do not advertise or profile.' },
    { h: 'Sharing', p: 'We never sell your data. We share only with providers strictly required to run the service (email/SMS delivery, hosting) and where legally required.' },
    { h: 'Your rights and contact', p: 'You have the right to access, correct and request deletion of your data. Requests: info@vasiapp.com' },
  ] },
  de: { title: 'Datenschutzerklärung', updated: UPDATED.de, sections: [
    { p: 'Bei Vasi ist uns dein Datenschutz wichtig. Diese Richtlinie erklärt, welche personenbezogenen Daten wir warum verarbeiten und welche Rechte du hast.' },
    { h: 'Erhobene Daten', p: 'Kontodaten (Name, E-Mail, optional Telefon), die von dir erstellten Nachrichten und Empfängerdaten, Sitzung und Sprachauswahl. Nachrichteninhalte und Empfänger-Kontaktdaten werden verschlüsselt gespeichert.' },
    { h: 'Verwendung', p: 'Wir nutzen Daten nur zur Bereitstellung des Dienstes: Konto verwalten, Nachrichten zum richtigen Zeitpunkt zustellen und Sicherheit gewährleisten. Keine Werbung, kein Profiling.' },
    { h: 'Weitergabe', p: 'Wir verkaufen deine Daten nicht. Wir geben sie nur an unbedingt erforderliche Dienstleister (E-Mail-/SMS-Versand, Hosting) und bei gesetzlicher Pflicht weiter.' },
    { h: 'Deine Rechte und Kontakt', p: 'Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten. Anfragen: info@vasiapp.com' },
  ] },
  fr: { title: 'Politique de confidentialité', updated: UPDATED.fr, sections: [
    { p: 'Chez Vasi, votre vie privée nous tient à cœur. Cette politique explique quelles données personnelles nous traitons, pourquoi, et vos droits.' },
    { h: 'Données collectées', p: "Informations de compte (nom, e-mail, téléphone facultatif), les messages que vous créez et les informations des destinataires, la session et la préférence de langue. Le contenu des messages et les coordonnées des destinataires sont chiffrés." },
    { h: 'Utilisation', p: "Nous utilisons les données uniquement pour fournir le service : gérer votre compte, remettre vos messages le moment venu et assurer la sécurité. Aucune publicité ni profilage." },
    { h: 'Partage', p: "Nous ne vendons jamais vos données. Nous ne les partageons qu'avec les prestataires strictement nécessaires (envoi e-mail/SMS, hébergement) et lorsque la loi l'exige." },
    { h: 'Vos droits et contact', p: "Vous avez le droit d'accéder à vos données, de les rectifier et d'en demander la suppression. Demandes : info@vasiapp.com" },
  ] },
  es: { title: 'Política de privacidad', updated: UPDATED.es, sections: [
    { p: 'En Vasi nos importa tu privacidad. Esta política explica qué datos personales tratamos, por qué y cuáles son tus derechos.' },
    { h: 'Datos que recopilamos', p: 'Datos de la cuenta (nombre, correo, teléfono opcional), los mensajes que creas y los datos de los destinatarios, la sesión y la preferencia de idioma. El contenido de los mensajes y los datos de contacto de los destinatarios se guardan cifrados.' },
    { h: 'Uso', p: 'Usamos los datos solo para prestar el servicio: gestionar tu cuenta, entregar tus mensajes cuando corresponda y mantener la seguridad. No hacemos publicidad ni perfilado.' },
    { h: 'Compartición', p: 'Nunca vendemos tus datos. Solo los compartimos con proveedores estrictamente necesarios (envío de correo/SMS, alojamiento) y cuando la ley lo exige.' },
    { h: 'Tus derechos y contacto', p: 'Tienes derecho a acceder, rectificar y solicitar la eliminación de tus datos. Solicitudes: info@vasiapp.com' },
  ] },
  ar: { title: 'سياسة الخصوصية', updated: UPDATED.ar, sections: [
    { p: 'في Vasi نهتم بخصوصيتك. توضّح هذه السياسة البيانات الشخصية التي نعالجها وسببها وحقوقك.' },
    { h: 'البيانات التي نجمعها', p: 'بيانات الحساب (الاسم، البريد الإلكتروني، الهاتف اختياري)، الرسائل التي تنشئها وبيانات المستلمين، الجلسة وتفضيل اللغة. يُخزَّن محتوى الرسائل وبيانات اتصال المستلمين مشفّرة.' },
    { h: 'كيفية الاستخدام', p: 'نستخدم البيانات فقط لتقديم الخدمة: إدارة حسابك، وتسليم رسائلك في وقتها، والحفاظ على الأمان. لا إعلانات ولا تحليل سلوكي.' },
    { h: 'المشاركة', p: 'لا نبيع بياناتك أبداً. نشاركها فقط مع مزوّدين ضروريين لتشغيل الخدمة (إرسال البريد/الرسائل، الاستضافة) وعند الإلزام القانوني.' },
    { h: 'حقوقك والتواصل', p: 'لديك الحق في الوصول إلى بياناتك وتصحيحها وطلب حذفها. للطلبات: info@vasiapp.com' },
  ] },
};

const kosullar: InfoContent = {
  tr: { title: 'Kullanım Şartları', updated: UPDATED.tr, sections: [
    { p: 'Vasi\'yi kullanarak bu şartları kabul edersin. Lütfen dikkatle oku.' },
    { h: 'Hizmet', p: 'Vasi, gelecekte iletilmek üzere mesaj bırakmanı sağlar. Hizmeti yasalara uygun ve başkalarının haklarına saygılı şekilde kullanmayı kabul edersin.' },
    { h: 'Hesap', p: 'Hesap bilgilerinin gizliliğinden sen sorumlusun. Doğru bilgi vermeli ve hesabını başkalarıyla paylaşmamalısın.' },
    { h: 'İçerik', p: 'Bıraktığın içerikten sen sorumlusun. Yasa dışı, zararlı veya başkalarının haklarını ihlal eden içerik yasaktır.' },
    { h: 'Sorumluluk ve değişiklik', p: 'Hizmet "olduğu gibi" sunulur. Bu şartları zaman zaman güncelleyebiliriz; önemli değişiklikleri bildiririz. Sorular için: info@vasiapp.com' },
  ] },
  en: { title: 'Terms of Service', updated: UPDATED.en, sections: [
    { p: 'By using Vasi you agree to these terms. Please read them carefully.' },
    { h: 'The service', p: 'Vasi lets you leave messages to be delivered in the future. You agree to use the service lawfully and with respect for others\' rights.' },
    { h: 'Your account', p: 'You are responsible for keeping your account credentials confidential. You must provide accurate information and not share your account.' },
    { h: 'Content', p: 'You are responsible for the content you leave. Unlawful, harmful, or rights-infringing content is prohibited.' },
    { h: 'Liability and changes', p: 'The service is provided "as is". We may update these terms from time to time and will notify you of material changes. Questions: info@vasiapp.com' },
  ] },
  de: { title: 'Nutzungsbedingungen', updated: UPDATED.de, sections: [
    { p: 'Durch die Nutzung von Vasi stimmst du diesen Bedingungen zu. Bitte lies sie sorgfältig.' },
    { h: 'Der Dienst', p: 'Mit Vasi kannst du Nachrichten hinterlassen, die in der Zukunft zugestellt werden. Du verpflichtest dich, den Dienst rechtmäßig und unter Achtung der Rechte anderer zu nutzen.' },
    { h: 'Dein Konto', p: 'Du bist für die Vertraulichkeit deiner Zugangsdaten verantwortlich. Du musst korrekte Angaben machen und dein Konto nicht teilen.' },
    { h: 'Inhalte', p: 'Du bist für die von dir hinterlassenen Inhalte verantwortlich. Rechtswidrige, schädliche oder rechteverletzende Inhalte sind untersagt.' },
    { h: 'Haftung und Änderungen', p: 'Der Dienst wird „wie besehen" bereitgestellt. Wir können diese Bedingungen gelegentlich aktualisieren und informieren über wesentliche Änderungen. Fragen: info@vasiapp.com' },
  ] },
  fr: { title: "Conditions d'utilisation", updated: UPDATED.fr, sections: [
    { p: "En utilisant Vasi, vous acceptez ces conditions. Veuillez les lire attentivement." },
    { h: 'Le service', p: "Vasi vous permet de laisser des messages à remettre dans le futur. Vous vous engagez à utiliser le service de manière légale et dans le respect des droits d'autrui." },
    { h: 'Votre compte', p: "Vous êtes responsable de la confidentialité de vos identifiants. Vous devez fournir des informations exactes et ne pas partager votre compte." },
    { h: 'Contenu', p: "Vous êtes responsable du contenu que vous laissez. Tout contenu illégal, nuisible ou portant atteinte aux droits d'autrui est interdit." },
    { h: 'Responsabilité et modifications', p: "Le service est fourni « en l'état ». Nous pouvons mettre à jour ces conditions de temps à autre et vous informerons des changements importants. Questions : info@vasiapp.com" },
  ] },
  es: { title: 'Términos de servicio', updated: UPDATED.es, sections: [
    { p: 'Al usar Vasi aceptas estos términos. Léelos con atención.' },
    { h: 'El servicio', p: 'Vasi te permite dejar mensajes para entregarlos en el futuro. Aceptas usar el servicio de forma legal y respetando los derechos de los demás.' },
    { h: 'Tu cuenta', p: 'Eres responsable de mantener la confidencialidad de tus credenciales. Debes facilitar información veraz y no compartir tu cuenta.' },
    { h: 'Contenido', p: 'Eres responsable del contenido que dejas. Se prohíbe el contenido ilegal, dañino o que infrinja derechos de terceros.' },
    { h: 'Responsabilidad y cambios', p: 'El servicio se presta "tal cual". Podemos actualizar estos términos de vez en cuando y te avisaremos de los cambios importantes. Consultas: info@vasiapp.com' },
  ] },
  ar: { title: 'شروط الخدمة', updated: UPDATED.ar, sections: [
    { p: 'باستخدامك Vasi فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية.' },
    { h: 'الخدمة', p: 'يتيح لك Vasi ترك رسائل تُسلَّم في المستقبل. أنت توافق على استخدام الخدمة بشكل قانوني واحترام حقوق الآخرين.' },
    { h: 'حسابك', p: 'أنت مسؤول عن الحفاظ على سرّية بيانات دخولك. يجب تقديم معلومات صحيحة وعدم مشاركة حسابك.' },
    { h: 'المحتوى', p: 'أنت مسؤول عن المحتوى الذي تتركه. يُحظر المحتوى غير القانوني أو الضار أو المنتهِك لحقوق الآخرين.' },
    { h: 'المسؤولية والتغييرات', p: 'تُقدَّم الخدمة "كما هي". قد نحدّث هذه الشروط من حين لآخر وسنُعلمك بالتغييرات الجوهرية. للأسئلة: info@vasiapp.com' },
  ] },
};

const kvkk: InfoContent = {
  tr: { title: 'KVKK / GDPR Aydınlatma Metni', updated: UPDATED.tr, sections: [
    { p: 'Bu metin, 6698 sayılı KVKK ve GDPR kapsamında kişisel verilerinin işlenmesine ilişkin bilgilendirmedir.' },
    { h: 'Veri sorumlusu', p: 'Veri sorumlusu Vasi\'dir. Kişisel verilerin, hizmeti sunmak amacıyla hukuka uygun şekilde işlenir.' },
    { h: 'İşlenen veriler ve amaç', p: 'Kimlik ve iletişim verilerin, mesaj ve alıcı verilerin; hesap yönetimi, mesaj iletimi ve güvenlik amacıyla işlenir. Hassas alanlar şifrelenir.' },
    { h: 'Haklar (KVKK m.11 / GDPR)', p: 'Verilerine erişme, düzeltme, silme, işlemeye itiraz ve veri taşınabilirliği haklarına sahipsin. Bu hakları kullanmak için info@vasiapp.com adresine başvurabilirsin.' },
  ] },
  en: { title: 'KVKK / GDPR Notice', updated: UPDATED.en, sections: [
    { p: 'This notice informs you about the processing of your personal data under Turkey\'s KVKK (Law No. 6698) and the GDPR.' },
    { h: 'Data controller', p: 'The data controller is Vasi. Your personal data is processed lawfully for the purpose of providing the service.' },
    { h: 'Data and purpose', p: 'Your identity and contact data, message and recipient data are processed for account management, message delivery and security. Sensitive fields are encrypted.' },
    { h: 'Your rights (KVKK Art. 11 / GDPR)', p: 'You have the right to access, correct, delete, object to processing, and to data portability. To exercise these rights, contact info@vasiapp.com' },
  ] },
  de: { title: 'KVKK-/DSGVO-Hinweis', updated: UPDATED.de, sections: [
    { p: 'Dieser Hinweis informiert über die Verarbeitung deiner personenbezogenen Daten gemäß dem türkischen KVKK (Gesetz Nr. 6698) und der DSGVO.' },
    { h: 'Verantwortlicher', p: 'Verantwortlicher ist Vasi. Deine personenbezogenen Daten werden rechtmäßig zum Zweck der Bereitstellung des Dienstes verarbeitet.' },
    { h: 'Daten und Zweck', p: 'Deine Identitäts- und Kontaktdaten, Nachrichten- und Empfängerdaten werden für Kontoverwaltung, Nachrichtenzustellung und Sicherheit verarbeitet. Sensible Felder werden verschlüsselt.' },
    { h: 'Deine Rechte (KVKK Art. 11 / DSGVO)', p: 'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Widerspruch gegen die Verarbeitung und Datenübertragbarkeit. Zur Ausübung: info@vasiapp.com' },
  ] },
  fr: { title: 'Avis KVKK / RGPD', updated: UPDATED.fr, sections: [
    { p: "Cet avis vous informe du traitement de vos données personnelles au titre de la loi turque KVKK (n° 6698) et du RGPD." },
    { h: 'Responsable du traitement', p: "Le responsable du traitement est Vasi. Vos données personnelles sont traitées licitement aux fins de la fourniture du service." },
    { h: 'Données et finalité', p: "Vos données d'identité et de contact, vos données de messages et de destinataires sont traitées pour la gestion du compte, la remise des messages et la sécurité. Les champs sensibles sont chiffrés." },
    { h: 'Vos droits (KVKK art. 11 / RGPD)', p: "Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition au traitement et à la portabilité. Pour les exercer : info@vasiapp.com" },
  ] },
  es: { title: 'Aviso KVKK / RGPD', updated: UPDATED.es, sections: [
    { p: 'Este aviso te informa sobre el tratamiento de tus datos personales conforme a la ley turca KVKK (n.º 6698) y al RGPD.' },
    { h: 'Responsable del tratamiento', p: 'El responsable del tratamiento es Vasi. Tus datos personales se tratan lícitamente con el fin de prestar el servicio.' },
    { h: 'Datos y finalidad', p: 'Tus datos de identidad y contacto, y los datos de mensajes y destinatarios se tratan para la gestión de la cuenta, la entrega de mensajes y la seguridad. Los campos sensibles se cifran.' },
    { h: 'Tus derechos (KVKK art. 11 / RGPD)', p: 'Tienes derecho de acceso, rectificación, supresión, oposición al tratamiento y portabilidad. Para ejercerlos: info@vasiapp.com' },
  ] },
  ar: { title: 'إشعار KVKK / GDPR', updated: UPDATED.ar, sections: [
    { p: 'يوضّح هذا الإشعار معالجة بياناتك الشخصية بموجب قانون KVKK التركي (رقم 6698) واللائحة العامة لحماية البيانات (GDPR).' },
    { h: 'المتحكم بالبيانات', p: 'المتحكم بالبيانات هو Vasi. تُعالَج بياناتك الشخصية بشكل قانوني بهدف تقديم الخدمة.' },
    { h: 'البيانات والغرض', p: 'تُعالَج بيانات هويتك واتصالك وبيانات الرسائل والمستلمين لأغراض إدارة الحساب وتسليم الرسائل والأمان. تُشفَّر الحقول الحساسة.' },
    { h: 'حقوقك (المادة 11 KVKK / GDPR)', p: 'لديك الحق في الوصول والتصحيح والحذف والاعتراض على المعالجة وقابلية نقل البيانات. لممارستها: info@vasiapp.com' },
  ] },
};

const ozellikler: InfoContent = {
  tr: { title: 'Özellikler', sections: [
    { p: 'Vasi, sevdiklerine geleceğe mesaj bırakmanın güvenilir yoludur.' },
    { h: 'Zamanlı teslimat', p: 'Mesajını yaz, tarihini seç; doğru anda alıcına ulaştıralım.' },
    { h: 'Güvenli ve özel', p: 'Mesaj içeriği ve alıcı bilgileri şifreli saklanır; içerik yalnızca alıcıya özel bağlantıyla görüntülenir.' },
    { h: 'Çok dilli', p: 'Arayüz 6 dilde (Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Arapça).' },
  ] },
  en: { title: 'Features', sections: [
    { p: 'Vasi is the trusted way to leave messages to your loved ones in the future.' },
    { h: 'Scheduled delivery', p: 'Write your message, pick a date, and we deliver it to your recipient at the right moment.' },
    { h: 'Secure and private', p: 'Message content and recipient details are stored encrypted; content is viewed only via a recipient-specific link.' },
    { h: 'Multilingual', p: 'The interface is available in 6 languages (Turkish, English, German, French, Spanish, Arabic).' },
  ] },
  de: { title: 'Funktionen', sections: [
    { p: 'Vasi ist der vertrauenswürdige Weg, deinen Liebsten Nachrichten für die Zukunft zu hinterlassen.' },
    { h: 'Geplante Zustellung', p: 'Schreibe deine Nachricht, wähle ein Datum, und wir stellen sie deinem Empfänger zum richtigen Zeitpunkt zu.' },
    { h: 'Sicher und privat', p: 'Nachrichteninhalte und Empfängerdaten werden verschlüsselt gespeichert; Inhalte sind nur über einen empfängerspezifischen Link sichtbar.' },
    { h: 'Mehrsprachig', p: 'Die Oberfläche ist in 6 Sprachen verfügbar (Türkisch, Englisch, Deutsch, Französisch, Spanisch, Arabisch).' },
  ] },
  fr: { title: 'Fonctionnalités', sections: [
    { p: "Vasi est le moyen de confiance pour laisser des messages à vos proches dans le futur." },
    { h: 'Remise programmée', p: "Écrivez votre message, choisissez une date, et nous le remettons à votre destinataire au bon moment." },
    { h: 'Sécurisé et privé', p: "Le contenu des messages et les coordonnées des destinataires sont chiffrés ; le contenu n'est consultable que via un lien propre au destinataire." },
    { h: 'Multilingue', p: "L'interface est disponible en 6 langues (turc, anglais, allemand, français, espagnol, arabe)." },
  ] },
  es: { title: 'Características', sections: [
    { p: 'Vasi es la forma fiable de dejar mensajes a tus seres queridos en el futuro.' },
    { h: 'Entrega programada', p: 'Escribe tu mensaje, elige una fecha y lo entregamos a tu destinatario en el momento adecuado.' },
    { h: 'Seguro y privado', p: 'El contenido de los mensajes y los datos de los destinatarios se guardan cifrados; el contenido solo se ve mediante un enlace propio del destinatario.' },
    { h: 'Multilingüe', p: 'La interfaz está disponible en 6 idiomas (turco, inglés, alemán, francés, español, árabe).' },
  ] },
  ar: { title: 'الميزات', sections: [
    { p: 'Vasi هو الطريقة الموثوقة لترك رسائل لأحبائك في المستقبل.' },
    { h: 'تسليم مجدول', p: 'اكتب رسالتك واختر تاريخاً، ونحن نسلّمها إلى مستلمك في الوقت المناسب.' },
    { h: 'آمن وخاص', p: 'يُخزَّن محتوى الرسائل وبيانات المستلمين مشفّرة؛ ولا يُعرَض المحتوى إلا عبر رابط خاص بالمستلم.' },
    { h: 'متعدد اللغات', p: 'الواجهة متاحة بـ 6 لغات (التركية، الإنجليزية، الألمانية، الفرنسية، الإسبانية، العربية).' },
  ] },
};

const guvenlik: InfoContent = {
  tr: { title: 'Güvenlik', sections: [
    { p: 'Güvenlik, Vasi\'nin temelidir. Verilerini korumak için modern yöntemler kullanırız.' },
    { h: 'Şifreleme', p: 'Mesaj içeriği ve alıcı iletişim bilgileri AES-256-GCM ile şifrelenir. Şifreler PBKDF2 ile saklanır.' },
    { h: 'Erişim', p: 'Hesap işlemleri token tabanlı kimlik doğrulamayla korunur; hassas işlemlerde tek kullanımlık kod (OTP) istenir.' },
  ] },
  en: { title: 'Security', sections: [
    { p: 'Security is foundational to Vasi. We use modern methods to protect your data.' },
    { h: 'Encryption', p: 'Message content and recipient contact details are encrypted with AES-256-GCM. Passwords are stored with PBKDF2.' },
    { h: 'Access', p: 'Account actions are protected by token-based authentication; sensitive actions require a one-time code (OTP).' },
  ] },
  de: { title: 'Sicherheit', sections: [
    { p: 'Sicherheit ist die Grundlage von Vasi. Wir setzen moderne Methoden zum Schutz deiner Daten ein.' },
    { h: 'Verschlüsselung', p: 'Nachrichteninhalte und Empfänger-Kontaktdaten werden mit AES-256-GCM verschlüsselt. Passwörter werden mit PBKDF2 gespeichert.' },
    { h: 'Zugriff', p: 'Kontoaktionen sind durch tokenbasierte Authentifizierung geschützt; sensible Aktionen erfordern einen Einmalcode (OTP).' },
  ] },
  fr: { title: 'Sécurité', sections: [
    { p: "La sécurité est au cœur de Vasi. Nous utilisons des méthodes modernes pour protéger vos données." },
    { h: 'Chiffrement', p: "Le contenu des messages et les coordonnées des destinataires sont chiffrés avec AES-256-GCM. Les mots de passe sont stockés avec PBKDF2." },
    { h: 'Accès', p: "Les actions du compte sont protégées par une authentification basée sur des jetons ; les actions sensibles nécessitent un code à usage unique (OTP)." },
  ] },
  es: { title: 'Seguridad', sections: [
    { p: 'La seguridad es la base de Vasi. Usamos métodos modernos para proteger tus datos.' },
    { h: 'Cifrado', p: 'El contenido de los mensajes y los datos de contacto de los destinatarios se cifran con AES-256-GCM. Las contraseñas se guardan con PBKDF2.' },
    { h: 'Acceso', p: 'Las acciones de la cuenta están protegidas con autenticación basada en tokens; las acciones sensibles requieren un código de un solo uso (OTP).' },
  ] },
  ar: { title: 'الأمان', sections: [
    { p: 'الأمان أساس Vasi. نستخدم أساليب حديثة لحماية بياناتك.' },
    { h: 'التشفير', p: 'يُشفَّر محتوى الرسائل وبيانات اتصال المستلمين باستخدام AES-256-GCM. وتُخزَّن كلمات المرور باستخدام PBKDF2.' },
    { h: 'الوصول', p: 'تُحمى إجراءات الحساب بمصادقة قائمة على الرموز؛ وتتطلب الإجراءات الحساسة رمزاً لمرة واحدة (OTP).' },
  ] },
};

const yolharitasi: InfoContent = {
  tr: { title: 'Yol Haritası', sections: [
    { p: 'Vasi\'yi sürekli geliştiriyoruz. Önümüzdeki dönemde planladıklarımızdan bazıları:' },
    { h: 'Yakında', p: '• SMS ile bildirim ve doğrulama\n• Google ve Apple ile giriş\n• Daha fazla dil ve tema seçeneği' },
  ] },
  en: { title: 'Roadmap', sections: [
    { p: 'We keep improving Vasi. Some of what we have planned for the coming period:' },
    { h: 'Coming soon', p: '• SMS notifications and verification\n• Sign in with Google and Apple\n• More language and theme options' },
  ] },
  de: { title: 'Roadmap', sections: [
    { p: 'Wir verbessern Vasi kontinuierlich. Einiges, das wir für die kommende Zeit planen:' },
    { h: 'Demnächst', p: '• SMS-Benachrichtigungen und -Verifizierung\n• Anmeldung mit Google und Apple\n• Mehr Sprach- und Themenoptionen' },
  ] },
  fr: { title: 'Feuille de route', sections: [
    { p: "Nous améliorons Vasi en continu. Voici une partie de ce que nous prévoyons pour la période à venir :" },
    { h: 'Bientôt', p: '• Notifications et vérification par SMS\n• Connexion avec Google et Apple\n• Plus de langues et de thèmes' },
  ] },
  es: { title: 'Hoja de ruta', sections: [
    { p: 'Mejoramos Vasi continuamente. Algo de lo que tenemos previsto para el próximo periodo:' },
    { h: 'Próximamente', p: '• Notificaciones y verificación por SMS\n• Inicio de sesión con Google y Apple\n• Más idiomas y temas' },
  ] },
  ar: { title: 'خارطة الطريق', sections: [
    { p: 'نطوّر Vasi باستمرار. بعض ما نخطط له في الفترة المقبلة:' },
    { h: 'قريباً', p: '• إشعارات وتحقق عبر الرسائل النصية\n• تسجيل الدخول عبر Google وApple\n• المزيد من اللغات والسمات' },
  ] },
};

const hakkimizda: InfoContent = {
  tr: { title: 'Hakkımızda', sections: [
    { p: 'Vasi, anlamlı sözlerin doğru zamanda ulaşması gerektiğine inanan küçük bir ekip tarafından kuruldu.' },
    { h: 'Misyonumuz', p: 'İnsanların sevdiklerine geleceğe güvenle mesaj bırakabilmesini sağlamak; mahremiyeti ve güveni merkeze koymak.' },
    { h: 'İletişim', p: 'Bize info@vasiapp.com adresinden ulaşabilirsin.' },
  ] },
  en: { title: 'About Us', sections: [
    { p: 'Vasi was founded by a small team that believes meaningful words should arrive at the right time.' },
    { h: 'Our mission', p: 'To let people leave messages to their loved ones in the future with confidence — putting privacy and trust at the center.' },
    { h: 'Contact', p: 'You can reach us at info@vasiapp.com.' },
  ] },
  de: { title: 'Über uns', sections: [
    { p: 'Vasi wurde von einem kleinen Team gegründet, das daran glaubt, dass bedeutsame Worte zur richtigen Zeit ankommen sollten.' },
    { h: 'Unsere Mission', p: 'Menschen zu ermöglichen, ihren Liebsten mit Vertrauen Nachrichten für die Zukunft zu hinterlassen – mit Privatsphäre und Vertrauen im Mittelpunkt.' },
    { h: 'Kontakt', p: 'Du erreichst uns unter info@vasiapp.com.' },
  ] },
  fr: { title: 'À propos', sections: [
    { p: "Vasi a été fondé par une petite équipe convaincue que les mots qui comptent doivent arriver au bon moment." },
    { h: 'Notre mission', p: "Permettre aux gens de laisser en toute confiance des messages à leurs proches pour le futur — en plaçant la confidentialité et la confiance au centre." },
    { h: 'Contact', p: 'Vous pouvez nous joindre à info@vasiapp.com.' },
  ] },
  es: { title: 'Acerca de', sections: [
    { p: 'Vasi fue fundada por un pequeño equipo que cree que las palabras significativas deben llegar en el momento adecuado.' },
    { h: 'Nuestra misión', p: 'Permitir que las personas dejen con confianza mensajes a sus seres queridos para el futuro, poniendo la privacidad y la confianza en el centro.' },
    { h: 'Contacto', p: 'Puedes escribirnos a info@vasiapp.com.' },
  ] },
  ar: { title: 'من نحن', sections: [
    { p: 'تأسّس Vasi على يد فريق صغير يؤمن بأن الكلمات المهمة يجب أن تصل في الوقت المناسب.' },
    { h: 'مهمتنا', p: 'تمكين الناس من ترك رسائل لأحبائهم في المستقبل بثقة، مع وضع الخصوصية والثقة في المقدمة.' },
    { h: 'تواصل', p: 'يمكنك مراسلتنا عبر info@vasiapp.com.' },
  ] },
};

const iletisim: InfoContent = {
  tr: { title: 'İletişim', sections: [
    { p: 'Sorularını, geri bildirimlerini ve destek taleplerini bekliyoruz.' },
    { h: 'E-posta', p: 'Her konuda bize info@vasiapp.com adresinden ulaşabilirsin. En kısa sürede dönüş yaparız.' },
  ] },
  en: { title: 'Contact', sections: [
    { p: 'We welcome your questions, feedback and support requests.' },
    { h: 'Email', p: 'Reach us any time at info@vasiapp.com. We will get back to you as soon as we can.' },
  ] },
  de: { title: 'Kontakt', sections: [
    { p: 'Wir freuen uns über deine Fragen, dein Feedback und Supportanfragen.' },
    { h: 'E-Mail', p: 'Erreiche uns jederzeit unter info@vasiapp.com. Wir melden uns so schnell wie möglich.' },
  ] },
  fr: { title: 'Contact', sections: [
    { p: 'Vos questions, commentaires et demandes de support sont les bienvenus.' },
    { h: 'E-mail', p: 'Contactez-nous à tout moment à info@vasiapp.com. Nous vous répondrons dès que possible.' },
  ] },
  es: { title: 'Contacto', sections: [
    { p: 'Nos encantan tus preguntas, comentarios y solicitudes de soporte.' },
    { h: 'Correo electrónico', p: 'Escríbenos cuando quieras a info@vasiapp.com. Te responderemos lo antes posible.' },
  ] },
  ar: { title: 'اتصل بنا', sections: [
    { p: 'نرحّب بأسئلتك وملاحظاتك وطلبات الدعم.' },
    { h: 'البريد الإلكتروني', p: 'تواصل معنا في أي وقت عبر info@vasiapp.com. سنردّ عليك في أقرب وقت ممكن.' },
  ] },
};

const comingSoon = (titles: Record<string, string>, bodies: Record<string, string>): InfoContent => {
  const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar'];
  const out: InfoContent = {};
  for (const l of langs) out[l] = { title: titles[l], sections: [{ p: bodies[l] }] };
  return out;
};

const blog = comingSoon(
  { tr: 'Blog', en: 'Blog', de: 'Blog', fr: 'Blog', es: 'Blog', ar: 'المدونة' },
  {
    tr: 'Blogumuz çok yakında burada. Hikâyeler, ipuçları ve güncellemeler için tekrar uğra.',
    en: 'Our blog is coming soon. Check back for stories, tips and updates.',
    de: 'Unser Blog kommt bald. Schau wieder vorbei für Geschichten, Tipps und Neuigkeiten.',
    fr: 'Notre blog arrive bientôt. Revenez pour des histoires, des conseils et des actualités.',
    es: 'Nuestro blog llegará pronto. Vuelve para ver historias, consejos y novedades.',
    ar: 'مدوّنتنا قريباً. عُد لاحقاً للقصص والنصائح والتحديثات.',
  }
);

const kariyer = comingSoon(
  { tr: 'Kariyer', en: 'Careers', de: 'Karriere', fr: 'Carrières', es: 'Empleo', ar: 'الوظائف' },
  {
    tr: 'Şu an açık pozisyon yok. İlgileniyorsan info@vasiapp.com adresinden bize yazabilirsin.',
    en: 'No open positions right now. If you are interested, write to us at info@vasiapp.com.',
    de: 'Derzeit keine offenen Stellen. Bei Interesse schreib uns an info@vasiapp.com.',
    fr: "Aucun poste ouvert pour le moment. Si cela vous intéresse, écrivez-nous à info@vasiapp.com.",
    es: 'No hay vacantes por ahora. Si te interesa, escríbenos a info@vasiapp.com.',
    ar: 'لا توجد وظائف شاغرة حالياً. إن كنت مهتماً، راسلنا على info@vasiapp.com.',
  }
);

export const INFO_PAGES: Record<string, InfoContent> = {
  gizlilik, kosullar, kvkk, ozellikler, guvenlik, yolharitasi, hakkimizda, iletisim, blog, kariyer,
};
