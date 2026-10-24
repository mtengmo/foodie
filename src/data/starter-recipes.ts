import type {Locale, Recipe} from '../domain/types';
import {createRecipe} from '../domain';
import {foodRepository} from './repository';
import {validateRecipe} from '../storage/recipes';

type Text = Record<Locale,string>;
export interface StarterRecipe {
  id:string; revision:number; title:Text; description:Text; servings:number;
  ingredients:{foodId:number;grams:number;note:Text}[];
  instructions:Record<Locale,string[]>; license:'CC0-1.0';
}
const ingredient=(foodId:number,grams:number,sv:string,en:string)=>({foodId,grams,note:{sv,en}});

// Original Foodie recipe texts, released under CC0. Food nutrition retains SLV CC BY 4.0 attribution.
// Gram amounts refer to the edible ingredient in the exact state named by the source record.
export const starterRecipes:StarterRecipe[] = [
  {
    id:'broccoli-lentil-soup',revision:1,title:{sv:'Broccoli- och linssoppa',en:'Broccoli and lentil soup'},
    description:{sv:'En enkel soppa med broccoli och färdigkokta röda linser.',en:'A simple soup with broccoli and ready-cooked red lentils.'},servings:4,license:'CC0-1.0',
    ingredients:[ingredient(325,500,'Rå broccoli, ansad','Raw broccoli, trimmed'),ingredient(3823,400,'Röda linser, konserv, avrunna','Canned red lentils, drained'),ingredient(344,150,'Gul lök, skalad','Yellow onion, peeled'),ingredient(2189,15,'Rapsolja','Rapeseed oil'),ingredient(1953,700,'Vatten, vägt i gram','Water, weighed in grams')],
    instructions:{sv:['Skär broccolin i små bitar och hacka löken. Låt linserna rinna av och väg upp 400 g.','Värm oljan i en kastrull. Fräs löken på medelvärme i cirka 5 minuter utan att bränna den.','Tillsätt broccoli och vatten. Sjud i 10–12 minuter tills broccolin är mjuk.','Rör ner linserna och värm tills soppan är genomvarm. Mixa till önskad konsistens och dela i fyra portioner.'],en:['Cut the broccoli into small pieces and chop the onion. Drain the lentils and weigh out 400 g.','Heat the oil in a saucepan. Soften the onion over medium heat for about 5 minutes without burning it.','Add the broccoli and water. Simmer for 10–12 minutes until the broccoli is tender.','Stir in the lentils and heat through. Blend to your preferred texture and divide into four portions.']}
  },
  {
    id:'broccoli-chickpea-salad',revision:1,title:{sv:'Broccolisallad med kikärtor',en:'Broccoli and chickpea salad'},
    description:{sv:'Finhackad rå broccoli, kikärtor och citron i en matig sallad.',en:'Finely chopped raw broccoli, chickpeas and lemon in a substantial salad.'},servings:2,license:'CC0-1.0',
    ingredients:[ingredient(325,250,'Rå broccoli, ansad','Raw broccoli, trimmed'),ingredient(3815,300,'Kikärtor, konserv, avrunna','Canned chickpeas, drained'),ingredient(364,200,'Rå tomat','Raw tomato'),ingredient(645,30,'Färskpressad citronjuice','Freshly squeezed lemon juice'),ingredient(2189,15,'Rapsolja','Rapeseed oil')],
    instructions:{sv:['Skölj broccolin och tomaterna. Finhacka broccolin och tärna tomaterna.','Låt kikärtorna rinna av och väg upp 300 g. Blanda med grönsakerna.','Vispa ihop citronjuice och olja och vänd ner i salladen. Låt stå 10 minuter och dela i två portioner.'],en:['Rinse the broccoli and tomatoes. Finely chop the broccoli and dice the tomatoes.','Drain the chickpeas and weigh out 300 g. Mix with the vegetables.','Whisk together the lemon juice and oil and toss through the salad. Leave for 10 minutes and divide into two portions.']}
  },
  {
    id:'salmon-potato-broccoli',revision:1,title:{sv:'Lax med potatis och broccoli',en:'Salmon with potatoes and broccoli'},
    description:{sv:'Ugnsbakad lax med kokt potatis, broccoli och citron.',en:'Oven-baked salmon with boiled potatoes, broccoli and lemon.'},servings:2,license:'CC0-1.0',
    ingredients:[ingredient(1255,300,'Rå laxfilé, utan ben','Raw salmon fillet, boneless'),ingredient(230,400,'Rå potatis, skalad','Raw potatoes, peeled'),ingredient(325,300,'Rå broccoli, ansad','Raw broccoli, trimmed'),ingredient(645,20,'Färskpressad citronjuice','Freshly squeezed lemon juice'),ingredient(2189,10,'Rapsolja','Rapeseed oil')],
    instructions:{sv:['Värm ugnen till 200 °C. Lägg laxen i en ugnsform och fördela olja och citronjuice över fisken.','Koka potatisen i vatten tills den är mjuk, cirka 15–20 minuter beroende på storlek. Häll bort kokvattnet.','Baka laxen tills den är genomlagad, cirka 15–20 minuter beroende på tjocklek.','Ånga broccolin i 5–7 minuter tills den är mjuk med lite tuggmotstånd. Servera i två portioner. Kokvatten som hälls bort ingår inte i ingrediensvikten.'],en:['Heat the oven to 200 °C. Put the salmon in an oven dish and spread the oil and lemon juice over it.','Boil the potatoes in water until tender, about 15–20 minutes depending on size. Drain the cooking water.','Bake the salmon until cooked through, about 15–20 minutes depending on thickness.','Steam the broccoli for 5–7 minutes until tender with a little bite. Serve in two portions. Discarded cooking water is not included in the ingredient weight.']}
  },
  {
    id:'bean-tomato-stew',revision:1,title:{sv:'Böngryta med tomat',en:'Bean and tomato stew'},
    description:{sv:'En vardagsgryta med kidneybönor, tomat och morot.',en:'An everyday stew with kidney beans, tomatoes and carrots.'},servings:4,license:'CC0-1.0',
    ingredients:[ingredient(3816,600,'Kidneybönor, konserv, avrunna','Canned kidney beans, drained'),ingredient(422,800,'Krossade tomater, med lag','Canned tomato pulp, including liquid'),ingredient(344,150,'Gul lök, skalad','Yellow onion, peeled'),ingredient(289,200,'Rå morot, ansad','Raw carrot, trimmed'),ingredient(2189,15,'Rapsolja','Rapeseed oil')],
    instructions:{sv:['Hacka löken och skär morötterna i små tärningar. Låt bönorna rinna av och väg upp 600 g.','Värm oljan i en gryta. Fräs lök och morot i cirka 5 minuter.','Tillsätt tomaterna med all lag. Sjud under lock i cirka 20 minuter tills morötterna är mjuka.','Rör ner de färdigkokta konservbönorna och sjud i ytterligare 5 minuter tills allt är genomvarmt. Dela i fyra portioner.'],en:['Chop the onion and finely dice the carrots. Drain the beans and weigh out 600 g.','Heat the oil in a saucepan. Soften the onion and carrot for about 5 minutes.','Add the tomatoes with all their liquid. Cover and simmer for about 20 minutes until the carrots are tender.','Stir in the ready-cooked canned beans and simmer for another 5 minutes until heated through. Divide into four portions.']}
  },
  {
    id:'overnight-oats-blueberries',revision:1,title:{sv:'Kallgröt med blåbär',en:'Overnight oats with blueberries'},
    description:{sv:'Havregryn, mjölk och blåbär som får stå i kylen över natten.',en:'Oats, milk and blueberries left in the fridge overnight.'},servings:2,license:'CC0-1.0',
    ingredients:[ingredient(702,100,'Havregryn, torra','Rolled oats, dry'),ingredient(123,300,'Mjölk, 3 % fett, berikad','Milk, 3% fat, fortified'),ingredient(555,150,'Färska blåbär, sköljda','Fresh bilberries, rinsed')],
    instructions:{sv:['Blanda havregryn och mjölk i en täckt skål eller två burkar.','Ställ i kylen över natten, cirka 8 timmar.','Rör om och toppa med de sköljda blåbären. Dela i två portioner.'],en:['Mix the oats and milk in a covered bowl or two jars.','Refrigerate overnight, for about 8 hours.','Stir and top with the rinsed fresh blueberries. Divide into two portions.']}
  },
  {
    id:'tofu-broccoli-pan',revision:1,title:{sv:'Tofupanna med broccoli',en:'Tofu and broccoli skillet'},
    description:{sv:'Tofu, broccoli och morot med en enkel sojasås.',en:'Tofu, broccoli and carrot with a simple soy sauce dressing.'},servings:2,license:'CC0-1.0',
    ingredients:[ingredient(905,300,'Fast tofu, avrunnen','Firm tofu, drained'),ingredient(325,300,'Rå broccoli, ansad','Raw broccoli, trimmed'),ingredient(289,150,'Rå morot, ansad','Raw carrot, trimmed'),ingredient(909,20,'Sojasås','Soy sauce'),ingredient(2189,15,'Rapsolja','Rapeseed oil'),ingredient(1953,50,'Vatten, vägt i gram','Water, weighed in grams')],
    instructions:{sv:['Tärna tofun. Skär broccolin i små buketter och moroten i tunna skivor.','Värm oljan i en stor stekpanna. Stek tofun i cirka 5 minuter och vänd då och då.','Tillsätt broccoli, morot och vatten. Lägg på lock och låt ånga på medelvärme i 5–7 minuter tills grönsakerna är mjuka.','Tillsätt sojasåsen och vänd runt tills allt är genomvarmt. Dela i två portioner.'],en:['Dice the tofu. Cut the broccoli into small florets and thinly slice the carrot.','Heat the oil in a large frying pan. Fry the tofu for about 5 minutes, turning occasionally.','Add the broccoli, carrot and water. Cover and steam over medium heat for 5–7 minutes until the vegetables are tender.','Add the soy sauce and toss until heated through. Divide into two portions.']}
  }
];

export async function createStarterRecipe(template:StarterRecipe,locale:Locale):Promise<Recipe> {
  const manifest=await foodRepository.getManifest();
  const foods=await Promise.all(template.ingredients.map(i=>foodRepository.getFood(i.foodId)));
  if(foods.some(food=>!food||food.snapshotId!==manifest.snapshotId))throw Error('Starter ingredients are unavailable in this dataset');
  return validateRecipe({
    ...createRecipe(manifest.snapshotId),title:template.title[locale],servings:template.servings,
    instructions:[...template.instructions[locale]],template:{id:template.id,revision:template.revision,locale},
    ingredients:template.ingredients.map((i,index)=>({id:crypto.randomUUID(),foodId:i.foodId,grams:i.grams,food:foods[index]!}))
  });
}
