export type Property = {
  id: number;
  title: string;
  location: string;
  city: string;
  neighborhood: string;
  price: string;
  details: string;
  trustScore: number;
  image: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  transactionType: "sale" | "rent";
  hasWater: boolean;
  hasElectricity: boolean;
  hasParking: boolean;
  pavedRoadAccess: boolean;
  whatsappNumber: string;
};

export const properties: Property[] = [
  {
    id: 1,
    title: "Modern villa in Ouaga 2000",
    location: "Ouaga 2000, Ouagadougou",
    city: "Ouagadougou",
    neighborhood: "Ouaga 2000",
    price: "45,000,000 FCFA",
    details: "3 bedrooms • 2 bathrooms • 350 m²",
    trustScore: 92,
    image: "/images/villa-ouaga-1.jpg",
    description:
      "A modern villa with a swimming pool, enclosed courtyard, parking, running water, electricity and easy road access.",
    bedrooms: 3,
    bathrooms: 2,
    area: 350,
    propertyType: "Villa",
    transactionType: "sale",
    hasWater: true,
    hasElectricity: true,
    hasParking: true,
    pavedRoadAccess: true,
    whatsappNumber: "22670000000",
  },
  {
    id: 2,
    title: "Apartment for rent in Karpala",
    location: "Karpala, Ouagadougou",
    city: "Ouagadougou",
    neighborhood: "Karpala",
    price: "175,000 FCFA/month",
    details: "2 bedrooms • 1 bathroom • 95 m²",
    trustScore: 78,
    image: "/images/villa-ouaga-2.jpg",
    description:
      "A clean two-bedroom apartment with a landscaped courtyard, water, electricity and enclosed parking.",
    bedrooms: 2,
    bathrooms: 1,
    area: 95,
    propertyType: "Apartment",
    transactionType: "rent",
    hasWater: true,
    hasElectricity: true,
    hasParking: true,
    pavedRoadAccess: false,
    whatsappNumber: "22671000000",
  },
  {
    id: 3,
    title: "Residential land in Balkuy",
    location: "Balkuy, Ouagadougou",
    city: "Ouagadougou",
    neighborhood: "Balkuy",
    price: "12,500,000 FCFA",
    details: "300 m² • Accessible road",
    trustScore: 85,
    image: "/images/villa-ouaga-3.jpg",
    description:
      "A residential property opportunity in Balkuy with accessible road connections and space suitable for family housing.",
    bedrooms: 0,
    bathrooms: 0,
    area: 300,
    propertyType: "Land",
    transactionType: "sale",
    hasWater: false,
    hasElectricity: false,
    hasParking: false,
    pavedRoadAccess: false,
    whatsappNumber: "22672000000",
  },
];