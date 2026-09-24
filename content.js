/* ---------------------------------------------------------------------------
   Every word and date on the site lives here. Edit this file, reload, done.

   BILINGUAL
   Any text a guest reads is written as { en: "...", gu: "..." }. The site shows
   one language at a time; the toggle at the top right switches it and remembers
   the choice. A plain string instead of a pair means the text is the same in
   both languages - a time like "4:00 PM", a brand name, a number.

   The four ceremony cards are the one deliberate exception: their headings show
   BOTH languages at once, because that is how the printed kankotri reads. Those
   live as `gu` and `en` on each event and are never switched.

   Anything left as an empty string "" hides itself and its label. Whole
   sections with nothing to show remove themselves, so it is safe to leave
   details blank until you have them.
   --------------------------------------------------------------------------- */

window.WEDDING = {

  /* Which language the site opens in for a first-time visitor: "en" or "gu".
     After that the visitor's own choice is remembered. */
  defaultLang: "en",

  couple: {
    groom:   { en: "Jeet",    gu: "જીત",     family: { en: "Jabuani", gu: "જબુઆણી" } },
    bride:   { en: "Bhavini", gu: "ભાવિની",  family: { en: "Nakrani",  gu: "નકરાણી" } },
    // Whose name reads first in the hero. "groom" or "bride".
    firstInHero: "groom",
    hashtag: "#JeetWedsBhavini",
  },

  // The date and place, shown under the names in the hero.
  headline: {
    datesLabel: { en: "1 – 2 December 2026", gu: "1 – 2 ડિસેમ્બર 2026" },
    venue: { en: "Oleander Farms", gu: "ઓલિએન્ડર ફાર્મ્સ" },
    city: { en: "Karjat, Maharashtra", gu: "કર્જત, મહારાષ્ટ્ર" },
  },

  // The formal invitation panel.
  invitation: {
    blessing: {
      en: "With the blessings of the divine",
      gu: "પ્રભુના આશીર્વાદ સાથે",
    },
    lead: {
      en: "request the honour of your presence at the wedding of",
      gu: "ના શુભ લગ્ન પ્રસંગે આપની ઉપસ્થિતિની હાર્દિક અપેક્ષા રાખીએ છીએ",
    },
    groomLine: {
      en: [
        "S/o Late Mr. Arvind Naran Jabuani",
        "& Mrs. Ranjana Arvind Jabuani"
      ],
      gu: [
        "સ્વ. શ્રી અરવિંદભાઈ નારણ જાબુઆની",
        "અને શ્રીમતી રંજના અરવિંદ જાબુઆનીના સુપુત્ર"
      ],
    },
    brideLine: {
      en: [
        "D/o Mr. Praveen Parbat Nakrani",
        "& Mrs. Manjula Praveen Nakrani"
      ],
      gu: [
        "શ્રી પ્રવીણ પરબત નાકરાણી",
        "અને શ્રીમતી મંજુલા પ્રવીણ નાકરાણીની સુપુત્રી"
      ],
    },
    weds: { en: "weds", gu: "સંગ" },
    closing: {
      en: "forever begins here",
      gu: "અહીંથી શરૂ થાય છે સદાકાળ",
    },
  },

  /* The clock counts down to this instant. Hastamelap, IST.
     Format: YYYY-MM-DDTHH:MM:SS+05:30 */
  countdownTo: "2026-12-02T17:41:00+05:30",

  /* The four ceremony cards.
     `gu` and `en` are the card's heading. They are shown TOGETHER on every
     card in both languages - do not make these a { en, gu } pair. Everything
     else on the card follows the site's language. */
  events: [
    {
      key: "mameru",
      gu: "મામેરું",
      en: "Mameru",
      enShift: "0.2em",
      tagline: { en: "Where Blessings Begin", gu: "આશીર્વાદોનો આરંભ" },
      ink: "sage",
      paper: "a",
      illustration: "assets/generated/user_mameru_final.png",
      wideIllustration: true,
      hangingOrnament: "assets/generated/user_hanging_lamps_medium.png",
      ornament: true,
      date: { en: "Tuesday, 1 December 2026", gu: "મંગળવાર, 1 ડિસેમ્બર 2026" },
      dateShort: { day: "01", month: { en: "December", gu: "ડિસેમ્બર" } },
      times: [{ label: "", value: { en: "9:00 AM", gu: "સવારે ૯.૦૦ વાગ્યે" } }],
      venue: { en: "Oleander Ballroom,\nKarjat", gu: "ઓલિએન્ડર બોલરૂમ,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: { en: "Traditional Festive", gu: "પરંપરાગત ઉત્સવ પરિધાન" },
      note: {
        en: "The maternal blessing, offered before the wedding days begin.",
        gu: "લગ્નના દિવસો શરૂ થાય તે પહેલાં મામા તરફથી અપાતા આશીર્વાદ.",
      },
    },
    {
      key: "sangeet",
      gu: "શામ શાનદાર",
      en: "Sangeet",
      enShift: "-0.5em",
      tagline: { en: "An Evening of Song & Dance", gu: "સંગીતની સંધ્યા" },
      ink: "indigo",
      paper: "b",
      illustration: "assets/generated/user_sangeet_final.png",
      wideIllustration: true,
      hangingOrnament: "assets/generated/user_hanging_lamps_medium.png",
      ornament: true,
      date: { en: "Tuesday, 1 December 2026", gu: "મંગળવાર, 1 ડિસેમ્બર 2026" },
      dateShort: { day: "01", month: { en: "December", gu: "ડિસેમ્બર" } },
      times: [{ label: "", value: { en: "7:00 PM", gu: "સાંજે ૭:૦૦ વાગ્યે" } }],
      venue: { en: "Oleander Lawn,\nKarjat", gu: "ઓલિએન્ડર લૉન,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: { en: "Blooming Glamour", gu: "બ્લૂમિંગ ગ્લેમર" },
      note: {
        en: "An evening of dhol, song and dancing.",
        gu: "ઢોલ, ગીત અને નૃત્યની એક સંધ્યા.",
      },
    },
    {
      key: "mandap",
      gu: "મંડપ રોપણ",
      en: "Mandap Ropan",
      enShift: "-0.2em",
      tagline: { en: "Raising the Sacred Canopy", gu: "મંડપની સ્થાપના" },
      ink: "gold",
      paper: "c",
      illustration: "assets/generated/user_mandap_clean.png",
      wideIllustration: true,
      hangingOrnament: "assets/generated/user_hanging_lamps_medium.png",
      ornament: true,
      date: { en: "Wednesday, 2 December 2026", gu: "બુધવાર, 2 ડિસેમ્બર 2026" },
      dateShort: { day: "02", month: { en: "December", gu: "ડિસેમ્બર" } },
      times: [{ label: "", value: { en: "8:00 AM", gu: "સવારે ૮:૦૦ વાગ્યે" } }],
      venue: { en: "Oleander Ballroom,\nKarjat", gu: "ઓલિએન્ડર બોલરૂમ,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: { en: "Yellow / Festive Ethnic", gu: "પીળા / શુભ પરિધાન" },
      note: {
        en: "The raising of the mandap, where the vows will be taken.",
        gu: "મંડપની સ્થાપના, જ્યાં લગ્નવિધિ સંપન્ન થશે.",
      },
    },
    {
      key: "lagna",
      gu: "લગ્ન",
      en: "Wedding",
      enShift: "0.2em",
      tagline: { en: "The Joining of Hands", gu: "હસ્તમેળાપ" },
      ink: "rose",
      paper: "a",
      illustration: "assets/generated/user_lagna_scene_final.png",
      wideIllustration: true,
      hangingOrnament: "assets/generated/user_hanging_lamps_medium.png",
      ornament: true,
      date: { en: "Wednesday, 2 December 2026", gu: "બુધવાર, 2 ડિસેમ્બર 2026" },
      dateShort: { day: "02", month: { en: "December", gu: "ડિસેમ્બર" } },
      times: [
        { label: { en: "Baraat Prastan", gu: "બરાત પ્રસ્થાન" }, value: { en: "4:00 PM", gu: "સાંજે ૪:૦૦ વાગ્યે" } },
        { label: { en: "Hastamelap",     gu: "હસ્તમેળાપ" },      value: { en: "5:41 PM", gu: "સાંજે ૫:૪૧ વાગ્યે" } },
      ],
      venue: { en: "Oleander Lake Side,\nKarjat", gu: "ઓલિએન્ડર લેકસાઇડ,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: { en: "Royal Ethnic / Traditional", gu: "શાહી પારંપરિક પરિધાન" },
      note: {
        en: "Hastamelap, the joining of hands, falls at 5:41 in the evening.",
        gu: "હસ્તમેળાપનું શુભ મુહૂર્ત સાંજે 5:41 વાગ્યે.",
      },
    },
  ],

  /* લી. સ્નેહાધીન — the hosting couples, as they appear on the kankotri. */
  hostsPaired: {
    heading: { en: "With love, yours affectionately", gu: "પ્રેમસહ, આપના સ્નેહી" },
    pairs: [
      [{ en: "Mr. Naran Kanji Jabuani",   gu: "શ્રી નારણ કાનજી જાબુઆની" },
       { en: "Mrs. Premila Naran Jabuani", gu: "શ્રીમતી પ્રેમિલા નારણ જાબુઆની" }],
      [{ en: "Mr. Dhiraj Naran Jabuani",  gu: "શ્રી ધીરજ નારણ જાબુઆની" },
       { en: "Mrs. Bhavna Dhiraj Jabuani", gu: "શ્રીમતી ભાવના ધીરજ જાબુઆની" }],
      [{ en: "Late Mr. Arvind Naran Jabuani",  gu: "સ્વ. શ્રી અરવિંદ નારણ જાબુઆની" },
       { en: "Mrs. Ranjana Arvind Jabuani", gu: "શ્રીમતી રંજના અરવિંદ જાબુઆની" }],
      [{ en: "Mr. Bhumit Dhiraj Jabuani", gu: "શ્રી ભૂમિત ધીરજ જાબુઆની" },
       { en: "Mrs. Prachi Bhumit Jabuani", gu: "શ્રીમતી પ્રાચી ભૂમિત જાબુઆની" }],
      [{ en: "Mr. Dhruv Dhiraj Jabuani",  gu: "શ્રી ધ્રુવ ધીરજ જાબુઆની" },
       { en: "Mrs. Nishita Dhruv Jabuani", gu: "શ્રીમતી નિશિતા ધ્રુવ જાબુઆની" }],
      [{ en: "Mr. Amrut Kanti Pokar",      gu: "શ્રી અમૃત કાંતિ પોકાર" },
       { en: "Mrs. Sangita Amrut Pokar",   gu: "શ્રીમતી સંગીતા અમૃત પોકાર" }],
      [{ en: "Mr. Deep Vipul Velani",      gu: "શ્રી દીપકુમાર વિપુલ વેલાણી" },
       { en: "Mrs. Kajal Deep Velani",     gu: "શ્રીમતી કાજલ દીપકુમાર વેલાણી" }],
      [{ en: "Pratham Amrut Pokar",        gu: "ચિ. પ્રથમ અમૃત પોકાર" },
       { en: "Ms. Nidhi Amrut Pokar",      gu: "કુ. નિધિ અમૃત પોકાર" }],
      [{ en: "Our dearest",                gu: "અમારી લાડલી" },
       { en: "Radhya Deep Velani",         gu: "રાધ્યા દીપ વેલાણી" }],
    ],
  },

  /* આપના આગમનના અભિલાષી — those awaiting your arrival. */
  hostsAwaiting: {
    heading: { en: "With warm anticipation of your arrival", gu: "આપના આગમનના અભિલાષી" },
    names: [
      { en: "Mrs. Vimala Dayaram Kanji Jabuani",  gu: "શ્રીમતી વિમલાબેન દયારામભાઈ કાનજીભાઈ જાબુઆની" },
      { en: "Mrs. Kanta Ravji Kanji Jabuani",     gu: "શ્રીમતી કાંતાબેન રવજીભાઈ કાનજીભાઈ જાબુઆની" },
      { en: "Mrs. Manjula Haresh Kanji Jabuani",  gu: "શ્રીમતી મંજુલાબેન હરેશભાઈ કાનજીભાઈ જાબુઆની" },
      { en: "Mrs. Aruna Kirti Kanji Jabuani",     gu: "શ્રીમતી અરૂણાબેન કીર્તિભાઈ કાનજીભાઈ જાબુઆની" },
      { en: "Mrs. Taruna Pankaj Dayaram Jabuani", gu: "શ્રીમતી તરુણા પંકજ દયારામ જાબુઆની" },
      { en: "Mrs. Nisha Sanjay Ravji Jabuani",    gu: "શ્રીમતી નિશા સંજય રવજી જાબુઆની" },
      { en: "Mrs. Anasuya Mehul Dayaram Jabuani", gu: "શ્રીમતી અનસૂયા મેહુલ દયારામ જાબુઆની" },
      { en: "Mrs. Bhumika Rajesh Ravji Jabuani",  gu: "શ્રીમતી ભૂમિકા રાજેશ રવજી જાબુઆની" },
      { en: "Mrs. Puja Sudhir Haresh Jabuani",    gu: "શ્રીમતી પૂજા સુધીર હરેશ જાબુઆની" },
      { en: "Mrs. Mayuri Jigar Kirti Jabuani",    gu: "શ્રીમતી મયુરી જીગર કીર્તિ જાબુઆની" },
      { en: "Mrs. Mohini Keval Kirti Jabuani",    gu: "શ્રીમતી મોહિની કેવલ કીર્તિ જાબુઆની" },
    ],
    solo: { en: "Jay Pankaj Jabuani", gu: "ચિ. જય પંકજભાઈ જાબુઆની" },
    children: {
      en: "Miti, Khushi, Vanshika, Kashyap, Yakshit, Darsh, Trisha, Bhavyansh, Jiyansh, Kiyanshi",
      gu: "મિતિ, ખુશી, વંશિકા, કશ્યપ, યક્ષિત, દર્શ, ત્રિશા, ભવ્યાંશ, જિયાંશ, કિયાંશી",
    },
  },

  gallery: {
    heading: { en: "Love in Focus", gu: "શુભારંભ" },
    subheading: { en: "(Photo Gallery)", gu: "(ફોટો ગેલેરી)" },
    caption: { en: "Moments we love", gu: "જીવનની મધુર ક્ષણો" },
    photos: [
      { src: "assets/photos/couple-beach-01.jpg",  alt: { en: "Jeet and Bhavini walking the shore below a limestone cliff", gu: "દરિયાકિનારે ચાલતાં જીત અને ભાવિની" } },
      { src: "assets/photos/couple-beach-02.jpg",  alt: { en: "Jeet and Bhavini running along the sand", gu: "રેતી પર દોડતાં જીત અને ભાવિની" } },
      { src: "assets/photos/couple-beach-03.jpg",  alt: { en: "Jeet and Bhavini sitting under a tree on the beach", gu: "દરિયાકિનારે વૃક્ષ નીચે બેઠેલાં જીત અને ભાવિની" } },
      { src: "assets/photos/couple-beach-04.jpg",  alt: { en: "Jeet and Bhavini on the sand by the water", gu: "પાણી પાસે રેતી પર જીત અને ભાવિની" } },
      { src: "assets/photos/couple-street-01.jpg", alt: { en: "Jeet and Bhavini beside a white vintage car", gu: "સફેદ વિન્ટેજ કાર પાસે જીત અને ભાવિની" } },
      { src: "assets/photos/couple-cafe-01.jpg",   alt: { en: "Jeet and Bhavini at a cafe by an arched window", gu: "કમાનવાળી બારી પાસે કૅફેમાં જીત અને ભાવિની" } },
      { src: "assets/photos/couple-street-02.jpg", alt: { en: "Jeet and Bhavini crossing an old town street", gu: "જૂના શહેરની શેરી ઓળંગતાં જીત અને ભાવિની" } },
    ],
  },

  /* * With Best Compliments From * */
  /* Postcard venue and destination section */
  postcard: {
    couple: { en: "Jeet & Bhavini", gu: "જીત અને ભાવિની" },
    dates: { en: "1st – 2nd December, 2026", gu: "૧ – ૨ ડિસેમ્બર ૨૦૨૬" },
    venueName: { en: "Oleander Farms", gu: "ઓલિએન્ડર ફાર્મ્સ" },
    address: {
      en: "Karjat Chowk Road, Wavarle Village, Khalapur, Karjat, Maharashtra 410201",
      gu: "કર્જત ચોક રોડ, વાવરલે ગામ, ખાલાપુર, કર્જત, મહારાષ્ટ્ર ૪૧૦૨૦૧"
    },
    note: {
      en: "Nestled in the lush hills of Karjat — join us as we celebrate our new beginning.",
      gu: "કર્જતની નયનરમ્ય વાડીઓ વચ્ચે... એક સોનેરી શરૂઆત, તમારી સ્નેહભરી હાજરી સાથે."
    },
    mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
    buttonText: { en: "View on Google Maps", gu: "ગૂગલ મેપ્સ પર જુઓ" },
    postmarkText: { en: "JEET & BHAVINI • 01.12.2026 • KARJAT •", gu: "જીત અને ભાવિની • 01.12.2026 • કર્જત •" },
  },

  compliments: {
    heading: { en: "With Best Compliments From", gu: "શુભેચ્છા સહ" },
    from: [
      { name: { en: "Asiatic Surface",         gu: "એશિયાટિક સરફેસ" },         city: { en: "Mumbai",     gu: "મુંબઈ" } },
      { name: { en: "Pegasus Panel Pvt. Ltd.", gu: "પેગાસસ પેનલ પ્રાઇવેટ લિમિટેડ" }, city: { en: "Gandhidham", gu: "ગાંધીધામ" } },
    ],
  },

  footer: {
    line:   { en: "Forever begins today", gu: "સદાકાળનો આરંભ આજથી" },
    credit: { en: "Crafted with love", gu: "પ્રેમથી બનાવેલું" },
  },

  /* ---------------------------------------------------------------------
     Interface text: buttons, section headings, labels. Everything a guest
     reads that is not part of the invitation's own wording.
     --------------------------------------------------------------------- */
  ui: {
    /* short codes for the segmented EN | ગુ toggle - both are always shown,
       so there's no room for the full "English"/"ગુજરાતી" the single-button
       version used. */
    langShort:         { en: "EN", gu: "ગુજ" },
    langSwitchTo:      { en: "ગુજરાતીમાં વાંચો", gu: "Read in English" },

    introEyebrow:      { en: "The wedding of", gu: "શુભ લગ્ન" },
    introSkip:         { en: "Skip", gu: "છોડો" },
    scrollCue:         { en: "Scroll", gu: "નીચે જુઓ" },
    introCueTitle:     { en: "Ring the bell", gu: "ઘંટ વગાડો" },
    introCueSub:       { en: "to begin the celebration", gu: "ઉજવણીનો પ્રારંભ કરવા" },
    portalCue:         { en: "Tap the gates to enter", gu: "દરવાજા ખોલવા સ્પર્શ કરો" },


    /* The hero IS the invitation, and these are its lines. Read straight
       through, with the names between the last two:

         Jabuani & Nakrani Family / cordially invite / Mr Dhrumil Shah /
         to the wedding of / Jeet & Bhavini

       With no ?for= link there is no name to place, so "you" stands in for
       one and the sentence still reads. That line - "you" or the guest's
       name - stays in English on both languages, by client request (set in
       main.js, renderGuestHandwriting).

       The Gujarati is not a word-for-word match. Gujarati puts the
       postposition after the noun, so "ના શુભ લગ્ન પ્રસંગે" cannot sit in
       front of the names the way "to the wedding of" does; it is set as a
       standalone occasion line instead, which is how a kankotri stacks it. */
    inviteHosts:       { en: "Jabuani Family", gu: "જાબુઆની પરિવાર" },
    inviteVerb:        { en: "cordially invites", gu: "ના હાર્દિક આમંત્રણ" },
    inviteOccasion:    { en: "to the wedding of", gu: "લગ્ન પ્રસંગમાં પધારજો" },

    eventsEyebrow:     { en: "Celebration Journey", gu: "ઉજવણીની યાદી" },
    eventsTitle:       { en: "Our Events", gu: "અમારા પ્રસંગો" },

    familiesEyebrow:   { en: "Our Families", gu: "અમારો પરિવાર" },
    familiesTitle:     { en: "With Love", gu: "સ્નેહીજનો" },

    countdownTitle:    { en: "Counting Down to <em>Forever</em>", gu: "બસ, હવે ક્ષણોની જ વાર..." },
    countdownArrived:  { en: "Today is <em>Forever</em>", gu: "આજે જ <em>સદાકાળ</em>" },
    cdDays:            { en: "Days", gu: "દિવસ" },
    cdHours:           { en: "Hours", gu: "કલાક" },
    cdMinutes:         { en: "Minutes", gu: "મિનિટ" },
    cdSeconds:         { en: "Seconds", gu: "સેકન્ડ" },

    /* Weekday heads for the save-the-date calendar, Sunday first. */
    calWeekdays:       { en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
                         gu: ["રવિ", "સોમ", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"] },

    // Screen-reader and tooltip labels.
    aPrevPhoto:        { en: "Previous photo", gu: "પાછલી તસવીર" },
    aNextPhoto:        { en: "Next photo", gu: "આગલી તસવીર" },
    aChoosePhoto:      { en: "Choose photo", gu: "તસવીર પસંદ કરો" },
    aPhotoN:           { en: "Photo", gu: "તસવીર" },
    aMusic:            { en: "Music", gu: "સંગીત" },
    aTop:              { en: "Back to top", gu: "ઉપર જાઓ" },
  },
};
