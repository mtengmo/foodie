import type {Locale, Recipe, RecipeLicense} from '../domain/types';
import {createRecipe} from '../domain';
import {foodRepository} from './repository';
import {validateRecipe} from '../storage/recipes';

type Text = Record<Locale,string>;
export interface StarterRecipe {
  id:string; revision:number; title:Text; description:Text; servings:number;
  ingredients:{foodId:number;grams:number;note:Text}[];
  instructions:Record<Locale,string[]>; license:RecipeLicense;
  source?:{title:string;url:string;authors:string;changes:Text};
}
const ingredient=(foodId:number,grams:number,sv:string,en:string)=>({foodId,grams,note:{sv,en}});

// Original texts are CC0; identified Wikibooks adaptations retain CC BY-SA 4.0.
// See docs/RECIPE-SOURCES.md for pinned sources and reviewed adaptations.
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
  },
  {
    id:'korvstroganoff-rice',revision:1,title:{sv:'Korvstroganoff med ris',en:'Swedish sausage stroganoff with rice'},
    description:{sv:'Falukorv i tomat- och gräddsås med ris. Riset ingår i näringsberäkningen.',en:'Falukorv in a creamy tomato sauce with rice. Rice is included in the nutrient estimate.'},servings:4,license:'CC0-1.0',
    ingredients:[ingredient(1487,500,'Falukorv, 19 % fett','Falukorv sausage, 19% fat'),ingredient(344,150,'Gul lök, skalad','Yellow onion, peeled'),ingredient(410,50,'Koncentrerad tomatpuré','Concentrated tomato purée'),ingredient(1717,250,'Matlagningsgrädde, 15 % fett','Cooking cream, 15% fat'),ingredient(1972,15,'Svensk senap','Swedish mustard'),ingredient(2189,10,'Rapsolja','Rapeseed oil'),ingredient(2481,240,'Långkornigt ris, torr vikt','Long-grain rice, dry weight'),ingredient(1953,480,'Vatten som riset får absorbera','Water to be absorbed by the rice')],
    instructions:{sv:['Koka det torra riset med 480 g vatten enligt förpackningens anvisning. Om riset kräver en annan vattenmängd, ändra ingrediensen i din kopia.','Skär korven i stavar och hacka löken. Stek i oljan på medelvärme tills löken mjuknar.','Rör ner tomatpurén och låt fräsa en minut. Tillsätt grädde och senap.','Sjud försiktigt i 5–10 minuter tills korven är genomvarm. Dela sås och ris i fyra portioner.'],en:['Cook the dry rice with 480 g water following the packet instructions. If it needs a different water amount, adjust that ingredient in your copy.','Cut the sausage into strips and chop the onion. Fry in the oil over medium heat until the onion softens.','Stir in the tomato purée for one minute, then add the cream and mustard.','Simmer gently for 5–10 minutes until heated through. Divide the sauce and rice into four servings.']}
  },
  {
    id:'entrecote-sweet-potato',revision:1,title:{sv:'Entrecôte med rostad sötpotatis',en:'Rib-eye steak with roasted sweet potato'},
    description:{sv:'Stekt entrecôte med sötpotatisklyftor och broccoli. Alla vikter avser råa, ansade ingredienser.',en:'Pan-seared rib-eye with sweet potato wedges and broccoli. Weights refer to raw, trimmed ingredients.'},servings:2,license:'CC0-1.0',
    ingredients:[ingredient(960,350,'Rå entrecôte utan ben','Raw boneless rib-eye steak'),ingredient(3765,500,'Rå sötpotatis, skalad','Raw sweet potato, peeled'),ingredient(325,250,'Rå broccoli, ansad','Raw broccoli, trimmed'),ingredient(2189,20,'Rapsolja, till potatis och stekning','Rapeseed oil, for potatoes and frying'),ingredient(1975,2,'Joderat salt','Iodised salt')],
    instructions:{sv:['Värm ugnen till 220 °C. Skär sötpotatisen i jämnstora klyftor och blanda med 15 g olja och hälften av saltet.','Rosta i 25–35 minuter tills klyftorna är mjuka och har fått färg. Vänd efter halva tiden.','Torka köttet och salta med resten av saltet. Hetta upp en panna med återstående 5 g olja. Stek på båda sidor och anpassa tiden efter tjocklek och önskad stekgrad.','Låt köttet vila cirka 5 minuter. Ånga broccolin tills den är mjuk med tuggmotstånd och servera i två portioner.'],en:['Heat the oven to 220 °C. Cut the sweet potato into even wedges and toss with 15 g oil and half the salt.','Roast for 25–35 minutes until tender and browned, turning halfway through.','Pat the steak dry and season with the remaining salt. Heat a pan with the remaining 5 g oil. Sear both sides, adjusting cooking time to thickness and preferred doneness.','Rest the steak for about 5 minutes. Steam the broccoli until tender with a little bite and divide into two servings.']}
  },
  {
    id:'roasted-sweet-potato',revision:1,title:{sv:'Rostad sötpotatis',en:'Roasted sweet potato'},
    description:{sv:'Ett enkelt tillbehör med sötpotatis, olja och salt.',en:'A simple side dish of sweet potato, oil and salt.'},servings:4,license:'CC0-1.0',
    ingredients:[ingredient(3765,800,'Rå sötpotatis, skalad','Raw sweet potato, peeled'),ingredient(2189,20,'Rapsolja','Rapeseed oil'),ingredient(1975,2,'Joderat salt','Iodised salt')],
    instructions:{sv:['Värm ugnen till 220 °C. Skär sötpotatisen i jämnstora bitar.','Blanda med olja och salt på en plåt. Rosta i 25–35 minuter och vänd efter halva tiden.','Servera när bitarna är mjuka och har fått färg. Dela i fyra portioner som tillbehör.'],en:['Heat the oven to 220 °C. Cut the sweet potato into even pieces.','Toss with the oil and salt on a baking tray. Roast for 25–35 minutes, turning halfway through.','Serve when tender and browned. Divide into four side portions.']}
  },
  {
    id:'wikibooks-greek-salad',revision:1,title:{sv:'Grekisk sallad',en:'Greek salad'},
    description:{sv:'Sallad med tomat, gurka, paprika, oliver och salladsost. Bearbetad från Wikibooks.',en:'Tomato, cucumber, pepper, olives and white cheese. Adapted from Wikibooks.'},servings:4,license:'CC-BY-SA-4.0',
    source:{title:'Cookbook:Greek Salad',url:'https://en.wikibooks.org/w/index.php?title=Cookbook:Greek_Salad&oldid=4518144',authors:'Wikibooks contributors',changes:{sv:'Översatt och bearbetad av Foodie: fyra portioner och gramvikter valda; citronjuice vald, oregano utelämnad och salladsost använd som näringsmotsvarighet till feta.',en:'Translated and adapted by Foodie: four servings and gram weights assigned; lemon juice selected, oregano omitted and white sheep/goat cheese used as the feta nutrient match.'}},
    ingredients:[ingredient(364,400,'Rå tomat','Raw tomato'),ingredient(339,300,'Rå gurka','Raw cucumber'),ingredient(4947,80,'Röd lök, skalad','Red onion, peeled'),ingredient(350,100,'Grön paprika, ansad','Green bell pepper, trimmed'),ingredient(402,80,'Svarta oliver, avrunna, utan kärnor','Black olives, drained and pitted'),ingredient(94,150,'Salladsost av får-/getmjölk, 22 % fett','White sheep/goat cheese, 22% fat'),ingredient(35,25,'Olivolja','Olive oil'),ingredient(645,20,'Färskpressad citronjuice','Fresh lemon juice'),ingredient(1975,2,'Joderat salt','Iodised salt')],
    instructions:{sv:['Skär grönsakerna i bitar och lägg i en skål med oliverna.','Vänd ner citronjuice, salt och olja.','Lägg osten ovanpå och dela i fyra portioner.'],en:['Chop the vegetables and combine with the olives.','Toss with the lemon juice, salt and oil.','Top with the cheese and divide into four portions.']}
  },
  {
    id:'wikibooks-tomato-salad',revision:1,title:{sv:'Tomatsallad med lök och vitlök',en:'Tomato salad with onion and garlic'},
    description:{sv:'Tomatsallad med lättkokt lök. Bearbetad från Wikibooks.',en:'Tomato salad with briefly boiled onion. Adapted from Wikibooks.'},servings:4,license:'CC-BY-SA-4.0',
    source:{title:'Cookbook:Tomato Salad',url:'https://en.wikibooks.org/w/index.php?title=Cookbook:Tomato_Salad&oldid=4518182',authors:'Wikibooks contributors',changes:{sv:'Översatt och bearbetad av Foodie: gramvikter och fyra portioner valda; hela tomaten används och peppar utelämnas. Löken vägs rå före kokning.',en:'Translated and adapted by Foodie: gram weights and four servings assigned; tomato centres retained and pepper omitted. Onion weighed raw before boiling.'}},
    ingredients:[ingredient(364,750,'Rå tomat, hela ätliga delen','Raw tomato, whole edible portion'),ingredient(344,150,'Gul lök, skalad, rå vikt','Yellow onion, peeled, raw weight'),ingredient(371,9,'Vitlök, skalad','Garlic, peeled'),ingredient(35,15,'Olivolja','Olive oil'),ingredient(1975,2,'Joderat salt','Iodised salt')],
    instructions:{sv:['Finhacka löken, koka cirka 4 minuter och låt rinna av. Kokvattnet hälls bort.','Tärna tomaterna och finhacka vitlöken.','Blanda med löken, oljan och saltet. Dela i fyra portioner som tillbehör.'],en:['Finely chop the onion, boil for about 4 minutes and drain. Discard the cooking water.','Dice the tomatoes and mince the garlic.','Mix with the onion, oil and salt. Divide into four side portions.']}
  },
  {
    id:'wikibooks-hummus',revision:1,title:{sv:'Hummus med tahini',en:'Hummus with tahini'},
    description:{sv:'Kikärtsröra med tahini och vitlök, bearbetad från Wikibooks med färdigkokta kikärtor.',en:'Chickpea dip with tahini and garlic, adapted from Wikibooks using ready-cooked chickpeas.'},servings:6,license:'CC-BY-SA-4.0',
    source:{title:'Cookbook:Hummus I',url:'https://en.wikibooks.org/w/index.php?title=Cookbook:Hummus_I&oldid=4515548',authors:'Wikibooks contributors',changes:{sv:'Översatt och bearbetad av Foodie: avrunna konservkikärtor ersätter blötlagda och kokta; bikarbonat utelämnas. Citronvarianten, gramvikter och sex portioner valda.',en:'Translated and adapted by Foodie: drained canned chickpeas replace soaking and boiling; baking soda omitted. Lemon variation, gram weights and six servings selected.'}},
    ingredients:[ingredient(3815,400,'Konservkikärtor, avrunna','Canned chickpeas, drained'),ingredient(3602,60,'Tahini','Tahini'),ingredient(371,6,'Vitlök, skalad','Garlic, peeled'),ingredient(645,30,'Färskpressad citronjuice','Fresh lemon juice'),ingredient(1953,50,'Vatten','Water'),ingredient(7199,2,'Spiskumminfrön, finstötta','Cumin seeds, finely crushed'),ingredient(7193,5,'Färska korianderblad','Fresh coriander leaves'),ingredient(1975,2,'Joderat salt','Iodised salt')],
    instructions:{sv:['Låt kikärtorna rinna av och väg upp 400 g.','Mixa med tahini, vitlök, citronjuice och vatten till en röra.','Rör ner salt och spiskummin. Toppa med koriander och dela i sex portioner som tillbehör.'],en:['Drain the chickpeas and weigh out 400 g.','Blend with tahini, garlic, lemon juice and water.','Stir in the salt and cumin. Top with coriander and divide into six side portions.']}
  }
];

export async function createStarterRecipe(template:StarterRecipe,locale:Locale):Promise<Recipe> {
  const manifest=await foodRepository.getManifest();
  const foods=await Promise.all(template.ingredients.map(i=>foodRepository.getFood(i.foodId)));
  if(foods.some(food=>!food||food.snapshotId!==manifest.snapshotId))throw Error('Starter ingredients are unavailable in this dataset');
  return validateRecipe({
    ...createRecipe(manifest.snapshotId),title:template.title[locale],servings:template.servings,
    instructions:[...template.instructions[locale]],template:{id:template.id,revision:template.revision,locale,license:template.license,...(template.source?{source:{...template.source,changes:template.source.changes[locale]}}:{})},
    ingredients:template.ingredients.map((i,index)=>({id:crypto.randomUUID(),foodId:i.foodId,grams:i.grams,food:foods[index]!}))
  });
}
