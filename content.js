/* ---------------------------------------------------------------------------
   Every word and date on the site lives here. Edit this file, reload, done.

   Anything left as an empty string "" hides itself and its label. Whole
   sections with nothing to show remove themselves, so it is safe to leave
   details blank until you have them.
   --------------------------------------------------------------------------- */

window.WEDDING = {

  couple: {
    groom:   { en: "Jeet",    gu: "જીત",     family: "Jabuvani" },
    bride:   { en: "Bhavini", gu: "ભાવિની",  family: "Nakrani"  },
    // Whose name reads first in the hero. "groom" or "bride".
    firstInHero: "groom",
    hashtag: "#JeetWedsBhavini",
  },

  // Shown under the names in the hero.
  headline: {
    datesLabel: "1 – 2 December 2026",
    // Leave blank until the venue is confirmed; the line disappears.
    venue: "",
    city: "Gandhidham",
  },

  // The formal invitation panel.
  invitation: {
    blessing:  "With the blessings of the divine",
    lead:      "request the honour of your presence at the wedding of",
    groomLine: "S/o Mr. Arvind Naran Jabuvani & Mrs. Ranjana Arvind Jabuvani",
    brideLine: "D/o Mr. Praveen Nakrani & Mrs. Manjula Nakrani",
    closing:   "12ᵗʰ … forever begins here",
  },

  /* The clock counts down to this instant. Hastamelap, IST.
     Format: YYYY-MM-DDTHH:MM:SS+05:30 */
  countdownTo: "2026-12-02T17:41:00+05:30",

  events: [
    {
      key: "mameru",
      gu: "મામેરું",
      en: "Mameru",
      tagline: "Where Blessings Begin",
      accent: "sage",
      motif: "assets/generated/motif_mamera.png",
      date: "Tuesday, 1 December 2026",
      dateShort: { day: "01", month: "December" },
      times: [{ label: "", value: "9:00 AM" }],
      venue: "",
      dress: "",
    },
    {
      key: "sangeet",
      gu: "શામ શાનદાર",
      en: "Sangeet",
      tagline: "An Evening of Song",
      accent: "charcoal",
      motif: "assets/generated/motif_sangeet.png",
      date: "Tuesday, 1 December 2026",
      dateShort: { day: "01", month: "December" },
      times: [{ label: "", value: "7:00 PM" }],
      venue: "",
      dress: "",
    },
    {
      key: "mandap",
      gu: "માંડવ રોપણ",
      en: "Mandap Ropan",
      tagline: "Raising the Sacred Canopy",
      accent: "terracotta",
      motif: "assets/generated/motif_mandap.png",
      date: "Wednesday, 2 December 2026",
      dateShort: { day: "02", month: "December" },
      times: [{ label: "", value: "8:00 AM" }],
      venue: "",
      dress: "",
    },
    {
      key: "lagna",
      gu: "લગ્ન",
      en: "Wedding",
      tagline: "The Joining of Hands",
      accent: "magenta",
      motif: "assets/generated/motif_lagna.png",
      wideMotif: true,
      date: "Wednesday, 2 December 2026",
      dateShort: { day: "02", month: "December" },
      times: [
        { label: "Bharat Prastan", value: "4:00 PM" },
        { label: "Bharat Aagman",  value: "5:00 PM" },
        { label: "હસ્તમેળાપ · Hastamelap", value: "5:41 PM" },
      ],
      venue: "",
      dress: "",
    },
  ],

  /* લી. સ્નેહાધીન — the hosting couples, as they appear on the kankotri. */
  hostsPaired: {
    heading:   "લી. સ્નેહાધીન",
    headingEn: "With love, yours affectionately",
    pairs: [
      ["Mr. Naran Kanji Jabuvani",   "Mrs. Premila Naran Jabuvani"],
      ["Mr. Dhiraj Naran Jabuvani",  "Mrs. Bhavna Dhiraj Jabuvani"],
      ["Mr. Arvind Naran Jabuvani",  "Mrs. Ranjana Arvind Jabuvani"],
      ["Mr. Bhumit Dhiraj Jabuvani", "Mrs. Prachi Bhumit Jabuvani"],
      ["Mr. Dhruv Dhiraj Jabuvani",  "Mrs. Nishita Dhruv Jabuvani"],
      ["Mr. Amrut Kanti Pokar",      "Mrs. Sangita Amrut Pokar"],
      ["Mr. Deep Vipul Velani",      "Mrs. Kajal Deep Velani"],
      ["Pratham Amrut Pokar",        "Ms. Nidhi Amrut Pokar"],
    ],
  },

  /* આપના આગમનના અભિલાષી — those awaiting your arrival. */
  hostsAwaiting: {
    heading:   "આપના આગમનના અભિલાષી",
    headingEn: "With warm anticipation of your arrival",
    names: [
      "અ.સૌ. વિમળાબેન દયારામભાઈ કાનજીભાઈ જબુઆણી",
      "અ.સૌ. કાન્તાબેન રવજીભાઈ કાનજીભાઈ જબુઆણી",
      "અ.સૌ. મંજુલાબેન હરેશભાઈ કાનજીભાઈ જબુઆણી",
      "અ.સૌ. અરુણાબેન કીર્તિભાઈ કાનજીભાઈ જબુઆણી",
      "અ.સૌ. તરુણાબેન પંકજભાઈ દયારામભાઈ જબુઆણી",
      "અ.સૌ. નિશાબેન સંજયભાઈ રવજીભાઈ જબુઆણી",
      "અ.સૌ. અનસુયાબેન મેહુલભાઈ દયારામભાઈ જબુઆણી",
      "અ.સૌ. ભુમિકાબેન રાજેશભાઈ રવજીભાઈ જબુઆણી",
      "અ.સૌ. પુજાબેન સુધિરભાઈ હરેશભાઈ જબુઆણી",
      "અ.સૌ. મયુરીબેન જિગરભાઈ કીર્તિભાઈ જબુઆણી",
      "અ.સૌ. મોહિનીબેન કેવલભાઈ કીર્તિભાઈ જબુઆણી",
    ],
    solo: "જય પંકજભાઈ જબુઆણી",
    children:
      "તથા મિતિ, ખુશી, વંશીકા, કશ્યપ, યક્ષીત, દર્શ, ત્રિશા, ભવ્યાંશ, જિયાંશ, કિયાંશી",
  },

  gallery: {
    heading: "Gallery",
    caption: "Moments we love",
    photos: [
      { src: "assets/photos/couple-beach-01.jpg", alt: "Jeet and Bhavini on the shore" },
      { src: "assets/photos/couple-beach-02.jpg", alt: "Jeet and Bhavini by the water" },
    ],
  },

  rsvp: {
    eyebrow:  "Join the Celebration",
    heading:  "Will you join us?",
    body: "We have saved a seat for you — at our table, in our hearts, and " +
          "under a December sky. Come celebrate as we begin this new chapter.",
    cta:      "Yes, I'll be there",
    // Confirmations arrive over WhatsApp. Digits only, with country code.
    whatsapp: "917738047555",
    note:     "You'll be redirected to WhatsApp to confirm your attendance.",
    saveLabel: "Save the Date",
  },

  /* * With Best Compliments From * */
  compliments: {
    heading: "With Best Compliments From",
    from: [
      { name: "Asiatic Surface",        city: "Mumbai" },
      { name: "Pegasus Panel Pvt. Ltd.", city: "Gandhidham" },
    ],
  },

  footer: {
    line: "Forever begins today",
    credit: "Crafted with love",
  },
};
