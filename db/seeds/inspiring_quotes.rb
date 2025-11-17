# Bible Quotes Seeds (with Aussie Slang)
puts "Clearing existing quotes..."
InspiringQuote.destroy_all

quotes = [
  { quote: 'I can do all things through Christ who strengthens me.', author: 'Philippians 4:13', category: 'Strength', display_order: 1, aussie_slang: "You can do anything with the Big Fella backing you up, mate!" },
  { quote: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', author: 'Jeremiah 29:11', category: 'Hope', display_order: 2, aussie_slang: "The Big Guy's got good plans for ya - gonna make sure you're living your best life!" },
  { quote: 'Trust in the Lord with all your heart and lean not on your own understanding.', author: 'Proverbs 3:5', category: 'Faith', display_order: 3, aussie_slang: "Trust the Boss with everything, don't just rely on your own noggin, eh?" },
  { quote: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', author: 'Joshua 1:9', category: 'Courage', display_order: 4, aussie_slang: "Be tough as nails! No need to stress - the Big Fella's got your back wherever you roam!" },
  { quote: 'The Lord is my shepherd, I lack nothing.', author: 'Psalm 23:1', category: 'Peace', display_order: 5, aussie_slang: "The Boss looks after me like a good shepherd - I've got everything I need, mate!" },
  { quote: 'Commit to the Lord whatever you do, and he will establish your plans.', author: 'Proverbs 16:3', category: 'Work', display_order: 6, aussie_slang: "Hand over your work to the Big Guy and He'll sort out your plans, no worries!" },
  { quote: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.', author: 'Isaiah 40:31', category: 'Strength', display_order: 7, aussie_slang: "Put your faith in the Boss and you'll be flying high like a wedge-tail eagle!" },
  { quote: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.', author: '1 Corinthians 13:4', category: 'Love', display_order: 8, aussie_slang: "Real love takes its time, treats people fair dinkum, and doesn't show off like a galah!" },
  { quote: 'Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.', author: 'Philippians 4:6', category: 'Peace', display_order: 9, aussie_slang: "Don't get your knickers in a knot - just have a yarn with the Big Guy about it!" },
  { quote: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.', author: 'Colossians 3:23', category: 'Work', display_order: 10, aussie_slang: "Give it your all at work, like you're doing it for the Boss upstairs, not just the boss downstairs!" },
  { quote: 'Be still, and know that I am God.', author: 'Psalm 46:10', category: 'Peace', display_order: 11, aussie_slang: "Just chill out for a sec and remember who's really in charge, mate!" },
  { quote: 'The Lord is my light and my salvation—whom shall I fear?', author: 'Psalm 27:1', category: 'Courage', display_order: 12, aussie_slang: "The Big Fella lights my way and saves me - what've I got to be scared of?" },
  { quote: 'And we know that in all things God works for the good of those who love him.', author: 'Romans 8:28', category: 'Faith', display_order: 13, aussie_slang: "The Boss makes everything work out for those who love Him - she'll be right!" },
  { quote: 'Cast all your anxiety on him because he cares for you.', author: '1 Peter 5:7', category: 'Peace', display_order: 14, aussie_slang: "Chuck all your worries to the Big Guy - He's looking after you, no dramas!" },
  { quote: 'With God all things are possible.', author: 'Matthew 19:26', category: 'Faith', display_order: 15, aussie_slang: "With the Big Fella, anything's possible - fair dinkum!" }
]

puts "Seeding Bible quotes..."

quotes.each do |quote_data|
  InspiringQuote.create!(quote_data)
end

puts "✅ Successfully seeded #{InspiringQuote.count} Bible quotes!"
