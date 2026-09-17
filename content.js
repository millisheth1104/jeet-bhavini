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
    groom:   { en: "Jeet",    gu: "જીત",     family: { en: "Jabuvani", gu: "જબુઆણી" } },
    bride:   { en: "Bhavini", gu: "ભાવિની",  family: { en: "Nakrani",  gu: "નકરાણી" } },
    // Whose name reads first in the hero. "groom" or "bride".
    firstInHero: "groom",
    hashtag: "#JeetWedsBhavini",
  },

  // Shown under the names in the hero.
  headline: {
    // The line that leads into the date - "Welcomes you to their wedding on
    // [date]" reads as one sentence split across two lines.
    welcomeLine: {
      en: "Welcomes you to their wedding on",
      gu: "તમારું તેમના લગ્નમાં હૃદયપૂર્વક સ્વાગત છે",
    },
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
      en: "S/o Mr. Arvind Naran Jabuvani & Mrs. Ranjana Arvind Jabuvani",
      gu: "સુપુત્ર: શ્રી અરવિંદભાઈ નારણભાઈ જબુઆણી તથા અ.સૌ. રંજનાબેન અરવિંદભાઈ જબુઆણી",
    },
    brideLine: {
      en: "D/o Mr. Praveen Nakrani & Mrs. Manjula Nakrani",
      gu: "સુપુત્રી: શ્રી પ્રવીણભાઈ નકરાણી તથા અ.સૌ. મંજુલાબેન પ્રવીણભાઈ નકરાણી",
    },
    weds: { en: "weds", gu: "સાથે" },
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
      tagline: { en: "Where Blessings Begin", gu: "આશીર્વાદનો આરંભ" },
      ink: "sage",
      paper: "a",
      illustration: "assets/generated/user_mameru_final.png",
      wideIllustration: true,
      hangingOrnament: "assets/generated/user_hanging_lamps_medium.png",
      ornament: true,
      date: { en: "Tuesday, 1 December 2026", gu: "મંગળવાર, 1 ડિસેમ્બર 2026" },
      dateShort: { day: "01", month: { en: "December", gu: "ડિસેમ્બર" } },
      times: [{ label: "", value: "9:00 AM" }],
      venue: { en: "Oleander Farms,\nKarjat", gu: "ઓલિએન્ડર ફાર્મ્સ,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: "",
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
      times: [{ label: "", value: "7:00 PM" }],
      venue: { en: "Oleander Farms,\nKarjat", gu: "ઓલિએન્ડર ફાર્મ્સ,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: "",
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
      times: [{ label: "", value: "8:00 AM" }],
      venue: { en: "Oleander Farms,\nKarjat", gu: "ઓલિએન્ડર ફાર્મ્સ,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: "",
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
        { label: { en: "Baraat Prastan", gu: "બરાત પ્રસ્થાન" }, value: "4:00 PM" },
        { label: { en: "Baraat Aagman",  gu: "બરાત આગમન" },     value: "5:00 PM" },
        { label: { en: "Hastamelap",     gu: "હસ્તમેળાપ" },      value: "5:41 PM" },
      ],
      venue: { en: "Oleander Farms,\nKarjat", gu: "ઓલિએન્ડર ફાર્મ્સ,\nકર્જત" },
      mapsUrl: "https://www.google.com/maps?q=Oleander+Farms+Luxury+Resort+in+Karjat,+Oleander+Farms+Pvt+Ltd,+Karjat+Chowk+Road,+Wavarle+Village,+Khalapur,+Karjat,+Maharashtra+410201&ftid=0x3be7fb6826b24a5f:0x54850d6bd73b6698",
      dress: "",
      note: {
        en: "Hastamelap, the joining of hands, falls at 5:41 in the evening.",
        gu: "હસ્તમેળાપનું શુભ મુહૂર્ત સાંજે 5:41 વાગ્યે.",
      },
    },
  ],

  /* લી. સ્નેહાધીન — the hosting couples, as they appear on the kankotri. */
  hostsPaired: {
    heading: { en: "With love, yours affectionately", gu: "લી. સ્નેહાધીન" },
    pairs: [
      [{ en: "Mr. Naran Kanji Jabuvani",   gu: "શ્રી નારણભાઈ કાનજીભાઈ જબુઆણી" },
       { en: "Mrs. Premila Naran Jabuvani", gu: "અ.સૌ. પ્રેમિલાબેન નારણભાઈ જબુઆણી" }],
      [{ en: "Mr. Dhiraj Naran Jabuvani",  gu: "શ્રી ધીરજભાઈ નારણભાઈ જબુઆણી" },
       { en: "Mrs. Bhavna Dhiraj Jabuvani", gu: "અ.સૌ. ભાવનાબેન ધીરજભાઈ જબુઆણી" }],
      [{ en: "Mr. Arvind Naran Jabuvani",  gu: "શ્રી અરવિંદભાઈ નારણભાઈ જબુઆણી" },
       { en: "Mrs. Ranjana Arvind Jabuvani", gu: "અ.સૌ. રંજનાબેન અરવિંદભાઈ જબુઆણી" }],
      [{ en: "Mr. Bhumit Dhiraj Jabuvani", gu: "શ્રી ભૂમિતભાઈ ધીરજભાઈ જબુઆણી" },
       { en: "Mrs. Prachi Bhumit Jabuvani", gu: "અ.સૌ. પ્રાચીબેન ભૂમિતભાઈ જબુઆણી" }],
      [{ en: "Mr. Dhruv Dhiraj Jabuvani",  gu: "શ્રી ધ્રુવભાઈ ધીરજભાઈ જબુઆણી" },
       { en: "Mrs. Nishita Dhruv Jabuvani", gu: "અ.સૌ. નિશિતાબેન ધ્રુવભાઈ જબુઆણી" }],
      [{ en: "Mr. Amrut Kanti Pokar",      gu: "શ્રી અમૃતભાઈ કાંતિભાઈ પોકાર" },
       { en: "Mrs. Sangita Amrut Pokar",   gu: "અ.સૌ. સંગીતાબેન અમૃતભાઈ પોકાર" }],
      [{ en: "Mr. Deep Vipul Velani",      gu: "શ્રી દીપભાઈ વિપુલભાઈ વેલાણી" },
       { en: "Mrs. Kajal Deep Velani",     gu: "અ.સૌ. કાજલબેન દીપભાઈ વેલાણી" }],
      [{ en: "Pratham Amrut Pokar",        gu: "ચિ. પ્રથમ અમૃતભાઈ પોકાર" },
       { en: "Ms. Nidhi Amrut Pokar",      gu: "કુ. નિધિ અમૃતભાઈ પોકાર" }],
    ],
  },

  /* આપના આગમનના અભિલાષી — those awaiting your arrival. */
  hostsAwaiting: {
    heading: { en: "With warm anticipation of your arrival", gu: "આપના આગમનના અભિલાષી" },
    names: [
      { en: "Mrs. Vimala Dayaram Kanji Jabuvani",  gu: "અ.સૌ. વિમળાબેન દયારામભાઈ કાનજીભાઈ જબુઆણી" },
      { en: "Mrs. Kanta Ravji Kanji Jabuvani",     gu: "અ.સૌ. કાન્તાબેન રવજીભાઈ કાનજીભાઈ જબુઆણી" },
      { en: "Mrs. Manjula Haresh Kanji Jabuvani",  gu: "અ.સૌ. મંજુલાબેન હરેશભાઈ કાનજીભાઈ જબુઆણી" },
      { en: "Mrs. Aruna Kirti Kanji Jabuvani",     gu: "અ.સૌ. અરુણાબેન કીર્તિભાઈ કાનજીભાઈ જબુઆણી" },
      { en: "Mrs. Taruna Pankaj Dayaram Jabuvani", gu: "અ.સૌ. તરુણાબેન પંકજભાઈ દયારામભાઈ જબુઆણી" },
      { en: "Mrs. Nisha Sanjay Ravji Jabuvani",    gu: "અ.સૌ. નિશાબેન સંજયભાઈ રવજીભાઈ જબુઆણી" },
      { en: "Mrs. Anasuya Mehul Dayaram Jabuvani", gu: "અ.સૌ. અનસુયાબેન મેહુલભાઈ દયારામભાઈ જબુઆણી" },
      { en: "Mrs. Bhumika Rajesh Ravji Jabuvani",  gu: "અ.સૌ. ભુમિકાબેન રાજેશભાઈ રવજીભાઈ જબુઆણી" },
      { en: "Mrs. Puja Sudhir Haresh Jabuvani",    gu: "અ.સૌ. પુજાબેન સુધિરભાઈ હરેશભાઈ જબુઆણી" },
      { en: "Mrs. Mayuri Jigar Kirti Jabuvani",    gu: "અ.સૌ. મયુરીબેન જિગરભાઈ કીર્તિભાઈ જબુઆણી" },
      { en: "Mrs. Mohini Keval Kirti Jabuvani",    gu: "અ.સૌ. મોહિનીબેન કેવલભાઈ કીર્તિભાઈ જબુઆણી" },
    ],
    solo: { en: "Jay Pankaj Jabuvani", gu: "જય પંકજભાઈ જબુઆણી" },
    children: {
      en: "Miti, Khushi, Vanshika, Kashyap, Yakshit, Darsh, Trisha, Bhavyansh, Jiyansh, Kiyanshi",
      gu: "મિતિ, ખુશી, વંશીકા, કશ્યપ, યક્ષીત, દર્શ, ત્રિશા, ભવ્યાંશ, જિયાંશ, કિયાંશી",
    },
  },

  gallery: {
    heading: { en: "Gallery", gu: "તસવીરો" },
    caption: { en: "Moments we love", gu: "અમને પ્રિય ક્ષણો" },
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
  compliments: {
    heading: { en: "With Best Compliments From", gu: "શુભેચ્છા સહ" },
    from: [
      { name: "Asiatic Surface",         city: { en: "Mumbai",     gu: "મુંબઈ" } },
      { name: "Pegasus Panel Pvt. Ltd.", city: { en: "Gandhidham", gu: "ગાંધીધામ" } },
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
    langShort:         { en: "EN", gu: "ગુ" },
    langSwitchTo:      { en: "ગુજરાતીમાં વાંચો", gu: "Read in English" },

    introEyebrow:      { en: "The wedding of", gu: "શુભ લગ્ન" },
    introSkip:         { en: "Skip", gu: "છોડો" },
    scrollCue:         { en: "Scroll", gu: "નીચે જુઓ" },

    heroEyebrow:       { en: "Together with their families", gu: "પરિવારજનો સહિત" },

    eventsEyebrow:     { en: "Celebration Journey", gu: "ઉત્સવની સફર" },
    eventsTitle:       { en: "Our Events", gu: "અમારા પ્રસંગો" },

    familiesEyebrow:   { en: "Our Families", gu: "અમારો પરિવાર" },
    familiesTitle:     { en: "With Love", gu: "સ્નેહ સહિત" },

    countdownTitle:    { en: "Counting Down to <em>Forever</em>", gu: "<em>સદાકાળ</em> સુધીની ગણતરી" },
    countdownArrived:  { en: "Today is <em>Forever</em>", gu: "આજે જ <em>સદાકાળ</em>" },
    cdDays:            { en: "Days", gu: "દિવસ" },
    cdHours:           { en: "Hours", gu: "કલાક" },
    cdMinutes:         { en: "Minutes", gu: "મિનિટ" },
    cdSeconds:         { en: "Seconds", gu: "સેકન્ડ" },

    viewDetails:       { en: "View details", gu: "વિગતો જુઓ" },
    timeBegins:        { en: "Begins", gu: "શરૂઆત" },
    venueToFollow:     { en: "Venue details to follow.", gu: "સ્થળની વિગતો ટૂંક સમયમાં." },

    /* Weekday heads for the save-the-date calendar, Sunday first. */
    calWeekdays:       { en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
                         gu: ["રવિ", "સોમ", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"] },

    // Screen-reader and tooltip labels.
    aPrevPhoto:        { en: "Previous photo", gu: "પાછલી તસવીર" },
    aNextPhoto:        { en: "Next photo", gu: "આગલી તસવીર" },
    aChoosePhoto:      { en: "Choose photo", gu: "તસવીર પસંદ કરો" },
    aPhotoN:           { en: "Photo", gu: "તસવીર" },
    aClose:            { en: "Close", gu: "બંધ કરો" },
    aMusic:            { en: "Music", gu: "સંગીત" },
    aTop:              { en: "Back to top", gu: "ઉપર જાઓ" },
    aEventDetails:     { en: "Event details", gu: "પ્રસંગની વિગતો" },
  },
};
