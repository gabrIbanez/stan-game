import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.question.deleteMany();

  await prisma.question.createMany({
    data: [
      {
        text: "Pour quels accords signés en 1925 Aristide Briand et Gustav Stresemann ont-ils reçu le Nobel de la paix ?",
        category: "NOBEL DE LA PAIX",
        round: "QUALIFS",
        answerMode: "CARRE",
        correctAnswer: "Les accords de Locarno",
        options: [
          "Les accords de Paris",
          "Les accords de Sèvres",
          "Les accords de Genève",
          "Les accords de Locarno",
        ],
        qualifSlot: 1,
      },
      {
        text: "Quel pays a remporté la Coupe du monde de football en 1998 ?",
        category: "SPORT",
        round: "QUALIFS",
        answerMode: "CARRE",
        correctAnswer: "La France",
        options: ["Le Brésil", "L'Allemagne", "L'Italie", "La France"],
        qualifSlot: 2,
      },
      {
        text: "Quelle est la capitale de l'Australie ?",
        category: "GÉOGRAPHIE",
        round: "COMPET",
        answerMode: "DUO",
        correctAnswer: "Canberra",
        options: ["Sydney", "Canberra"],
        theme: "Capitales",
      },
      {
        text: "En quelle année a eu lieu la Révolution française ?",
        category: "HISTOIRE",
        round: "FINALE",
        answerMode: "CASH",
        correctAnswer: "1789",
        options: [],
      },
    ],
  });

  console.log("✓ Questions d'exemple créées");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
