-- Clear existing mock data if any
DELETE FROM products;
DELETE FROM categories;

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image) VALUES
('811802b1-5a04-43ff-90a4-d1ec21f2ec41', 'Navigation Systems', 'navigation-systems', 'Advanced GPS, radar, and electronic chart display systems for precise maritime navigation.', 'https://picsum.photos/seed/nav/600/400'),
('556133ef-ded8-4bb4-b77a-2f416e788bc5', 'Propulsion', 'propulsion', 'Marine propulsion systems, thrusters, propellers, and drive systems for all vessel types.', 'https://picsum.photos/seed/prop/600/400'),
('a718c3d9-a4c3-426c-85a2-bf72d15fbce2', 'Safety Equipment', 'safety-equipment', 'Life-saving appliances, fire suppression systems, and emergency signaling equipment.', 'https://picsum.photos/seed/safe/600/400'),
('ab2b6af2-73a1-4af9-a5e2-66cfd27c9d92', 'Deck Machinery', 'deck-machinery', 'Winches, capstans, cranes, and mooring equipment engineered for demanding deck operations.', 'https://picsum.photos/seed/deck/600/400'),
('978f8cb6-fb38-4e89-a564-929314c4c230', 'Marine Electronics', 'marine-electronics', 'Communication systems, AIS transponders, VHF radios, and satellite equipment.', 'https://picsum.photos/seed/elec/600/400'),
('34857b29-e856-42bb-a320-b3b44bade7df', 'Engine Room', 'engine-room', 'Generators, pumps, heat exchangers, and engine room monitoring systems.', 'https://picsum.photos/seed/eng/600/400');

-- Insert Products
INSERT INTO products (category_id, name, slug, sku, description, price, stock, specs, images) VALUES
(
  '811802b1-5a04-43ff-90a4-d1ec21f2ec41',
  'Furuno NavNet TZtouch3 19" MFD',
  'furuno-navnet-tztouch3-19',
  'NAV-FRN-T3-19',
  'The TZtouch3 is Furuno''s flagship multifunction display, featuring a 19" wide-screen touchscreen with ultra-bright IPS display. Integrates radar, sonar, AIS, and full chartplotter functionality.',
  4850,
  8,
  '{"Display Size": "19 inches", "Resolution": "1280 x 800 px", "GPS": "Built-in 10 Hz GPS/GNSS", "IP Rating": "IPX5"}',
  ARRAY['https://picsum.photos/seed/nav1a/800/600', 'https://picsum.photos/seed/nav1b/800/600', 'https://picsum.photos/seed/nav1c/800/600']
),
(
  '811802b1-5a04-43ff-90a4-d1ec21f2ec41',
  'Garmin GMR Fantom 54 Radar',
  'garmin-gmr-fantom-54',
  'NAV-GRM-F54',
  'The GMR Fantom 54 delivers industry-leading target separation with MotionScope Doppler technology. Solid-state 50W dome provides stunning target separation at all ranges.',
  3200,
  5,
  '{"Transmitter Power": "50W Solid State", "Range": "48 nm max", "IP Rating": "IPX6"}',
  ARRAY['https://picsum.photos/seed/nav2a/800/600']
),
(
  '556133ef-ded8-4bb4-b77a-2f416e788bc5',
  'Volvo Penta D6-400 Marine Diesel',
  'volvo-penta-d6-400',
  'PRO-VPD-6400',
  'The Volvo Penta D6-400 is a 5.5L inline-six diesel engine producing 400 hp at 3,500 rpm. Designed for planing and semi-planing hulls.',
  28500,
  3,
  '{"Power Output": "400 hp", "Displacement": "5.5L", "Fuel Type": "Diesel", "Weight (dry)": "520 kg"}',
  ARRAY['https://picsum.photos/seed/prop1a/800/600']
),
(
  '556133ef-ded8-4bb4-b77a-2f416e788bc5',
  'Vetus Bow Thruster BOW45',
  'vetus-bow-thruster-bow45',
  'PRO-VTB-45',
  'The Vetus BOW45 tunnel thruster delivers 45 kgf of thrust for precise low-speed maneuvering. Features a fiberglass tunnel for easy installation.',
  2100,
  12,
  '{"Thrust": "45 kgf", "Power": "5.5 kW (7.5 HP)", "Voltage": "12V / 24V DC"}',
  ARRAY['https://picsum.photos/seed/prop2a/800/600']
),
(
  'a718c3d9-a4c3-426c-85a2-bf72d15fbce2',
  'Viking RescYou PRO Life Raft 8-Person',
  'viking-rescyou-pro-8p',
  'SAF-VK-R8P',
  'SOLAS-compliant 8-person offshore life raft in valise pack. Includes full SOLAS-A equipment pack, thermal insulation, stabilizing ballast bags, and retroreflective tape.',
  6400,
  6,
  '{"Capacity": "8 persons", "Compliance": "SOLAS, LSA Code", "Pack Type": "Valise"}',
  ARRAY['https://picsum.photos/seed/safe1a/800/600']
),
(
  'a718c3d9-a4c3-426c-85a2-bf72d15fbce2',
  'McMurdo SmartFind G8 EPIRB',
  'mcmurdo-smartfind-g8-epirb',
  'SAF-MC-G8',
  'Category 1 float-free EPIRB with built-in GPS for precise location transmission. Automatically activates on contact with water. 406 MHz Cospas-Sarsat registered.',
  890,
  20,
  '{"Frequency": "406.028 MHz", "Battery Life": "> 24 hours at -20°C", "Battery Expiry": "5 years"}',
  ARRAY['https://picsum.photos/seed/safe2a/800/600']
),
(
  'ab2b6af2-73a1-4af9-a5e2-66cfd27c9d92',
  'MacGregor Hatch Cover Winch 5T',
  'macgregor-hatch-winch-5t',
  'DEC-MCG-W5T',
  'Heavy-duty hydraulic winch for hatch cover operations on bulk carriers and container vessels. Features fail-safe brake and manual backup release.',
  12750,
  2,
  '{"Rated Pull": "5T (50 kN)", "Wire Speed": "15 m/min", "Drive": "Hydraulic motor"}',
  ARRAY['https://picsum.photos/seed/deck1a/800/600']
),
(
  '978f8cb6-fb38-4e89-a564-929314c4c230',
  'Icom IC-M605 VHF Marine Transceiver',
  'icom-ic-m605-vhf',
  'ELC-ICM-605',
  'The IC-M605 is a CLASS D DSC fixed-mount VHF radio with integrated AIS receiver and Bluetooth connectivity.',
  680,
  15,
  '{"TX Power": "25W (Hi) / 1W (Lo)", "AIS Receiver": "Dual channel", "IPX Rating": "IPX8"}',
  ARRAY['https://picsum.photos/seed/elec1a/800/600']
),
(
  '34857b29-e856-42bb-a320-b3b44bade7df',
  'Kohler 17EFKOZD Marine Generator',
  'kohler-17efkozd-generator',
  'ENG-KHL-17EF',
  'The Kohler 17EFKOZD delivers 17kW of continuous AC power with exceptional fuel efficiency. Sound-attenuated enclosure for quiet operation.',
  9800,
  4,
  '{"Rated Power": "17 kW", "Voltage": "120/240V, single phase", "Engine": "Kohler 4-cylinder diesel"}',
  ARRAY['https://picsum.photos/seed/eng1a/800/600']
),
(
  '34857b29-e856-42bb-a320-b3b44bade7df',
  'Jabsco Marine Bilge Pump 24V',
  'jabsco-bilge-pump-24v',
  'ENG-JBS-BP24',
  'High-capacity automatic bilge pump with Rule-A-Matic float switch. 2000 GPH at open flow. Submersible motor, corrosion-resistant housing.',
  320,
  30,
  '{"Flow Rate": "2000 GPH (7570 L/hr)", "Voltage": "24V DC"}',
  ARRAY['https://picsum.photos/seed/eng2a/800/600']
);
