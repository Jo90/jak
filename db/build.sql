/* build.sql

insert into usr select * from jakOld.usr;

insert into location select * from jakOld.location;

insert into address select * from jakOld.address;

insert into dbTable (name) select table_name from information_schema.tables where table_schema='jak';
*/

delete from `prop`;
delete from `propType`;
delete from `propChild`;

INSERT INTO `prop` (id, name) VALUES
( 3, true, 'building interior'),	
( 4, true, 'building exterior'),	
( 5, true, 'room'),					
(21, false, 'site'),				
(22, false, 'building'),			
(23, false, 'land'),				
(24, false, 'bedroom'),
(25, false, 'bathroom'),
(26, false, 'lounge'),
(27, false, 'kitchen'),
(28, false, 'roof'),
(29, false, 'substrate'),
(41, false, 'wall'),
(42, false, 'ceiling'),
(43, false, 'floor'),
(44, false, 'door'),
(45, false, 'window'),
(46, false, 'decking')
;

(1, 'type'),
(2, 'site'),
(3, 'building interior'),
(8, 'building exterior'),
(4, 'land'),
(5, 'room'),
(7, 'room component'),
(9, 'roof'),
(10,'substrate');

INSERT INTO `propType` (prop, type) select id, 1 from prop;

INSERT INTO `prop` (id, name) VALUES
(21, 'wall'),
(22, 'ceiling'),
(23, 'floor'),
(24, 'door'),
(25, 'window'),
(26, 'wet area'),
(27, 'smoke detector'),
(28, 'electrical');

INSERT INTO `propType`(`prop`, `type`) select id, 7 from prop where id between 21 and 28;

INSERT INTO `prop` (id, name) VALUES
(31, 'site'),
(32, 'building'),
(33, 'land'),
(34, 'bedroom'),
(35, 'bathroom'),
(36, 'lounge'),
(37, 'kitchen'),
(38, 'roof'),
(39, 'substrate'),
(40, 'laundry'),
(41, 'stairs'),
(42, 'chimney/flue'),
(43, 'plumbing'),
(44, 'decks'),
(45, 'balconies'),
(46, 'awnings'),
(47, 'pergola'),
(48, 'exterior wall'),
(49, 'exterior window')
;

INSERT INTO `propType` (`prop`, `type`) VALUES
(31, 2),
(32, 3),
(32, 8),
(33, 4),
(34, 5),
(35, 5),
(36, 5),
(37, 5),
(38, 9),
(39, 10),
(40, 3),
(41, 3),
(42, 3),
(43, 3),
(44, 8),
(45, 8),
(46, 8),
(47, 8),
(48, 8),
(49, 8)
;

INSERT INTO `propChild` (`prop`, `child`) VALUES
(2, 3),
(2, 4),
(2, 8),
(3, 5),
(3, 9),
(3, 10),
(5, 7);

delete from `qa`;
INSERT INTO `qa` VALUES
(1, 2, NULL, 'Defect Minor', NULL, 'H', 'Defect Minor <textarea placeholder="description" data-ref="DM"></textarea>'),
(2, 1, NULL, 'Defect Major', NULL, 'H', 'Defect Major <textarea placeholder="description" data-ref="DMaj"></textarea>'),
(3, 4, NULL, 'Cracking', NULL, 'H', 'Cracking <textarea placeholder="description" data-ref="Crack"></textarea>'),
(4, 4, NULL, 'Advisory', NULL, 'H', 'Advisory <textarea placeholder="description" data-ref="Advisory"></textarea>'),
(5, 5, NULL, 'Safety', NULL, 'H', 'Safety <select><option>note</option><option>warning</option><option>critical</option></select><textarea placeholder="description" data-ref="Safety"></textarea>'),
(6, 6, NULL, 'Obstruction', NULL, 'H', 'Obstruction <textarea placeholder="description" data-ref="Obstruct"></textarea>'),
(7, 7, NULL, 'Inaccessible', NULL, 'H', 'Inaccessible <textarea placeholder="description" data-ref="Access"></textarea>'),
(8, 3, NULL, 'Information', NULL, 'H', 'Information<select data-ref="Info"><option>General</option><option>Advisory</option><option>Future consideration</option></select>'),
(9, 99, NULL, 'Termites', NULL, 'H', 'Termite: <select data-ref="Termite"><option>Coptotermes</option><option>Schedorhinotermes</option><option>Nasutitermes</option><option>Heterotermes</option></select>&nbsp;<label><input type="checkbox" data-ref="TermActive" />Live/Active</label><label><input type="checkbox" data-ref="TermNest" />Nest found</label> <textarea placeholder="notes" data-ref="TermNote"></textarea>'),
(101, 99, NULL, 'Borers', NULL, 'H', '<select data-ref="Borer"><option>Anobium punctatum (furniture beetle)</option><option>Lyctus brunneus (Powderpost beetle)</option><option>Calymmaderus incisus (Queensland pine beetle)</option></select>\r\nDamage caused: <select data-ref="BorerDamage"><option>Moderate</option><option>Moderate to Extensive</option><option>Extensive to Severe</option></select><textarea placeholder="notes" data-ref="BorerNote"></textarea>\r\n<label><input type="checkbox" placeholder="Borer Safety" data-ref="BorerSafety"></label>&nbsp; Reason/Recommendation: <textarea placeholder="notes" data-ref="BorerSafetyNote"></textarea>'),
(102, 99, NULL, 'Fungal Decay', NULL, 'H', 'Damage caused: <select data-ref="FungalDamage"><option>Moderate</option><option>Moderate to Extensive</option><option>Extensive to Severe</option></select><textarea placeholder="notes" data-ref="FDNote"></textarea>\r\n<label><input type="checkbox" placeholder="Fungal Safety" data-ref="FDSafety"></label>&nbsp; Reason/Recommendation: <textarea placeholder="notes" data-ref="FDSafetyNote"></textarea>'),

(10, 1, 24, 'Door', NULL, 'H', '<select data-ref="Door"><option>handle</option><option>damaged</option>\r\n<option>not coated</option>\r\n<option>rot damage</option>\r\n<option>missing/removed</option><option>out of square</option><option>other</option></select>\r\n<textarea data-ref="DoorNote"></textarea>'),
(11, 1, 25, 'Window', NULL, 'H', '<select data-ref="Window">\r\n<option>rot damage</option><option>damage to frame</option><option>cracked glass</option><option>other</option></select><textarea data-ref="WindowNote"></textarea>\r\n'),
(12, 1, 23, 'Floor', NULL, 'H', '<select data-ref="Floor">\r\n<option>drummy tiles in areas</option><option>tiles</option>\r\n<option>out of level in areas</option><option>significantly out of level</option>\r\n<option>damage</option>\r\n<option>skirting</option><option>other</option></select><textarea data-ref="FloorNote"></textarea>'),
(13, 1, 23, 'Kitchen Floor', 'P37', 'H', 'Kitchen Floor <input type="text" placeholder="Kitchen Floor" data-ref="KitchenFloor"/>'),
(14, 1, 21, 'Building Wall', 'P32', 'H', 'Building Wall <select><option>Interior</option><option>Exterior</option></select>'),
(15, 1, 23, 'Minor Defect Kitchen Floor', 'P37,Q1', 'H', 'Minor Defect Kitchen Floor\r\n<select>\r\n<option>something</option>\r\n<option>else</option>\r\n<select>'),
(16, 1, 31, 'Site Information', 'Q8', 'H', '<select>\r\n<option>Single Story</option>\r\n<option>Multistory</option>\r\n<option>Split level</option>\r\n<option>Brick</option>\r\n<option>Brick veneer</option>\r\n<option>Fibro</option>\r\n</select>\r\n<select>\r\n<option>Residential</option>\r\n<option>Commercial</option>\r\n<option>Industrial</option>\r\n</select>'),
(17, 1, 22, 'Ceiling', NULL, 'H', '<select data-ref="Ceiling">\r\n<option>height less than 2400mm</option>\r\n<option>sagging or collapsed</option>\r\n<option>damage</option>\r\n<option>water damage</option>\r\n<option>raised moisture levels</option>\r\n<option>termite damage</option>\r\n<option>damage to cornice</option>\r\n<option>nail popping</option>\r\n<option>water stains</option>\r\n<option>rising damp present</option>\r\n<option>other...</option></select>\r\n<textarea data-ref="CeilingNote"></textarea>'),
(18, 1, 22, 'Ceiling Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="CeilingFibro" />In fibro</label>\r\n<label><input type="checkbox" data-ref="CeilingMould" />Mould present</label>'),
(19, 1, 21, 'Wall', NULL, 'H', '<select data-ref="Wall" multiple="multiple">\r\n<option>water damage</option>\r\n<option>raised moisture levels</option>\r\n<option>internal load bearing wall removed</option>\r\n<option>termite damage</option>\r\n<option>wall lining incomplete</option>\r\n<option>nail popping</option>\r\n<option>damage to wall</option>\r\n<option>water stains</option>\r\n<option>rising damp present</option>\r\n<option>rendered walls drummy</option>\r\n<option>other...</option></select>\r\n<textarea data-ref="WallNote"></textarea>'),
(20, 1, 21, 'Wall Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="WallFibro" />In fibro</label>\r\n<label><input type="checkbox" data-ref="WallMould" />Mould present</label>'),
(21, 1, 26, 'Wet area', NULL, 'H', '<select data-ref="WetArea" multiple="multiple">\r\n<option>Water damage / damage to bench</option>\r\n<option>Water damage / damage to cupboard / shelving</option>\r\n<option>Drummy tiles in areas<option>\r\n<option>Tiles</option>\r\n<option>Grout loss at shower base floor tiles</option>\r\n<option>Water hammer present</option>\r\n<option>Shower rose leaking</option>\r\n<option>Tap leaking</option>\r\n<option>Mechanical vent not operating</option>\r\n<option>Mechanical vent required</option>\r\n<option>Toilet pan loose at floor</option>\r\n<option>Toilet pan damaged at base</option>	\r\n<option>Cistern</option>\r\n<option>Floor grade inadequate</option>\r\n<option>Floor waste not installed</option>\r\n<option>Shower screen is cracked</option>\r\n<option>Leaking detected below shower screen</option>\r\n<option>Leaking at base of shower</option>\r\n<option>Washtub rusting</option>\r\n<option>Junction of wall tiles and bench top require sealing</option>\r\n<option>Bath enamel is chipped / damaged</option>\r\n</select>'),
(22, 1, 24, 'Door Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="DoorRepair" />Requires maintenance/repairs</label>'),
(23, 1, 25, 'Window Inaccessible', 'Q7', 'H', '<label><input type="checkbox" data-ref="WindowLock" />Locked</label>&nbsp;\r\n<label><input type="checkbox" data-ref="WindowPaint" />Painted shut</label>'),
(24, 1, 25, 'Window Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="WindowRepair" />Requires maintenance / repairs for ease of use</label>\r\n'),
(25, 1, 23, 'Floor Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="FloorCreak" />Floor Creaking</label>'),
(26, 1, 37, 'Kitchen Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="KitchenAppliance" />Appliances damaged / not installed</label>'),
(27, 1, 40, 'Laundry Information', 'Q8', 'H', '<label><input type="checkbox" data-ref="LaundryInfo" />Shower installed</label>'),
(28, 1, 35, 'Bathroom Information', 'Q8', 'H', '<label><input type="checkbox" data-ref="BathShowerInfo" />Frameless shower</label>&nbsp;\r\n<label><input type="checkbox" data-ref="BathShowerSpa" />Spa</label>'),
(29, 1, 41, 'Stairs', NULL, 'H', '<select data-ref="Stairs" multiple="multiple">\r\n<option>treads are narrow</option><option>handrail missing</option>\r\n<option>handrail spacing too wide</option></select><textarea data-ref="StairsNote"></textarea>'),
(30, 1, 28, 'Electrical', NULL, 'H', '<select data-ref="Electrical" multiple="multiple">\r\n<option>damaged power point</option>\r\n<option>loose power point</option>\r\n<option>exposed electrical wiring in conduit</option>\r\n<option>damaged conduit</option>\r\n<option>damaged light switch</option>\r\n<option>loose light switch</option>\r\n<option>exposed electrical wiring</option>\r\n<option>loose electrical wiring</option>\r\n</select>\r\n<textarea data-ref="ElectricalNote"></textarea>'),
(31, 1, 28, 'Electrical Information', 'Q8', 'H', '<label><input type="checkbox" data-ref="ElectricalAC" />Air conditioner installed</label>'),
(32, 1, 43, 'Plumbing', NULL, 'H', '<select data-ref="Plumbing" multiple="multiple">\r\n<option>HWS leaking</option>\r\n<option>HWS outer casing damaged</option>\r\n<option>vent pipe</option>\r\n<option>surcharge gulley located under</option>\r\n<option>leaking pipes</option>\r\n<option>damaged pipes</option>\r\n<option>rusting water pipes</option>\r\n<option>leaking waste pipes</option>\r\n</select>\r\n<textarea data-ref="PlumbingNote"></textares>'),
(33, 1, 43, 'Plumbing Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="PlumbingGas" />Gas is connected</label>&nbsp;\r\n<label><input type="checkbox" data-ref="PlumbingBottle" />Gas by bottles</label>&nbsp;<label><input type="checkbox" data-ref="PlumbingBR" />Bottles removed</label>&nbsp;<label><input type="checkbox" data-ref="PlumbingGWP" />Galvanised water pipes</label>&nbsp;'),
(34, 1, 21, 'Exterior Wall Information', 'Q8', 'H', '<select data-ref="ExtWallInfo" multiple="multiple">\r\n<option>brick</option>\r\n<option>fibro</option>\r\n<option>permalum</option>\r\n<option>vinyl</option>\r\n<option>hardiplank</option>\r\n<option>w/board</option>\r\n<option>harditex</option>\r\n</select><textarea data-ref=EWINote></textarea>'),
(35, 1, 48, 'Exterior Wall', '', 'H', '<select data-ref="ExtWall" multiple="multiple">\r\n<option>High external ground level</option>\r\n<option>Drummy render at walls</option>\r\n<option>Wall cladding damaged</option>\r\n<option>Bricks missing</option>\r\n<option>Bricks eroding</option>\r\n<option>Drummy tiles</option>\r\n<option>Deterioration to bagged brickwork</option>\r\n<option>Efflorescence</option>\r\n<option>Wall cladding missing</option>\r\n<option>Patched bricks</option>\r\n<option>Mortar eroding</option>\r\n<option>Tiles</option>\r\n<option>Rot damage to external timber trims</option><textarea data-ref="ExtWallNote"></textarea>\r\n</select>'),
(36, 1, 49, 'Exterior Window', '', 'H', '<select data-ref="ExtWindow" multiple="multiple">\r\n<option>Weather strips showing deterioration</option>\r\n<option>Brick sills in contact with window frame</option>\r\n<option>Rot damage to window frames</option>\r\n<option>Deterioration in putty / seals</option>\r\n<option>Awnings require repairs / maintenance</option>\r\n<option>Missing glass</option>\r\n<option>Fly screens torn / damaged</option>\r\n<option>Cracked glass</option>\r\n</select><textarea data-ref="EWNote"></textarea>'),
(37, 1, 44, 'Decks', NULL, 'H', '<select data-ref="Decks" multiple="multiple">\r\n<option>Handrail showing movement</option>\r\n<option>Handrail damaged</option><option>Handrail height too low</option><option>Rot damage</option>\r\n<option>Handrail missing</option><option>Damage</option>\r\n<option>Posts in contact with soil</option>\r\n</select><textarea data-ref="DecksNote"></textarea>'),
(38, 1, 45, 'Balconies', NULL, 'H', '<select data-ref="Balconies" multiple="multiple">\r\n<option>Handrail showing movement</option>\r\n<option>Handrail damaged</option><option>Handrail height too low</option><option>Rot damage</option>\r\n<option>Handrail missing</option><option>Damage</option>\r\n<option>Posts in contact with soil</option>\r\n</select><textarea data-ref="BalconiesNote"></textarea>'),
(39, 1, 46, 'Awnings', NULL, 'H', '<select data-ref="Awnings" multiple="multiple">\r\n<option>Roof sheeting not in TLM</option>\r\n<option>Damaged roof sheeting</option>\r\n<option>Missing roof sheeting</option>\r\n<option>Nail holes roof sheeting</option>\r\n<option>Awning not in TLM</option>\r\n<option>Awning undersized timbers</option>\r\n<option>Posts in contact with soil</option>\r\n<option>Rot damage to timbers</option>\r\n<option>Damage</option>\r\n<option>Guttering damaged</option>\r\n<option>Downpipe damaged</option>\r\n<option>Guttering missing</option>\r\n<option>Downpipe missing</option>\r\n<option>Guttering rusting</option>\r\n<option>Downpipe rusting</option>\r\n<option>Damaged SW</option>\r\n<option>Downpipe not connected SW</option>\r\n<option>Downpipe not adequately connected to SW</option>\r\n</select><textarea data-ref="AwningsNote"></textarea>'),
(40, 1, 47, 'Pergola', NULL, 'H', '<select data-ref="Pergola" multiple="multiple">\r\n<option>Pergola not in TLM</option>\r\n<option>Pergola undersized timbers</option>\r\n<option>Posts in contact with soil</option>\r\n<option>Rot damage to timbers</option>\r\n<option>Damage</option>\r\n</select><textarea data-ref="PergolaNote"></textarea>'),
(41, 1, 48, 'Subfloor', NULL, 'H', '<label><input type="checkbox" data-ref="SubfloorSlab" />Slab</label><label><input type="checkbox" data-ref="SubfloorTimber" />Timber Floor</label><select data-ref="Subfloor" multiple="multiple">\r\n<option>Rot damage to bearers / joists</option>\r\n<option>Previous shower leaking rot damage</option>\r\n<option>Temporary dry laid pier</option>\r\n<option>Piers rotation/subsidence</option>\r\n<option>Piers missing</option>\r\n<option>Bricks eroding</option>\r\n<option>Framing poorly constructed/undersized timbers</option>\r\n<option>Deterioration soil batter</option>\r\n<option>Subterranean termite damage</option>\r\n<option>Mortar eroding</option>\r\n<option>Shower leaking rot damage</option>\r\n<option>Piers excess packing</option>\r\n<option>Bearer not supported</option>\r\n<option>Piers constructed on paths</option>\r\n<option>Efflorescence to brickwork</option>\r\n<option>Joists constructed cc over 450mm</option></select><textarea data-ref="SubfloorNote"></textarea>\r\nTermite Shields<select data-ref="SFTermite"><option>N/A</option><option>Adequate</option><option>Inadequate</option><option>Rusting</option><option>Missing</option><option>Not in TLM</option></select><textarea data-ref="SFTermiteNote"></textarea>\r\nDrainage<select data-ref="SFDrainage"><option>Adequate</option><option>Channelling/Pooling</option><option>Inadequate</option></select><textarea data-ref="SFDrainageNote"></textarea>\r\nVentilation<select data-ref="SFVentilation"><option>Adequate</option><option>Inadequate</option></select><textarea data-ref="SFVentilationNote"></textarea>'),
(42, 1, 48, 'Subfloor Borer', 'Q101', 'H', '<select data-ref="SubfloorBorer" multiple="multiple">\r\n<option>Lyctus borer</option>\r\n<option>Anobium Borer Flooring</option></select><textarea data-ref="SFBorerNote"></textarea>'),
(43, 1, 48, 'Subfloor Information', 'Q8', 'H', '<label><input type="checkbox" data-ref="SubfloorInfo" />Formwork / loose timbers / stored goods</label>'),
(44, 1, 49, 'Roof Space', NULL, 'H', '<select data-ref="Roofspace" multiple="multiple">\r\n<option>Ceiling lining separation</option>\r\n<option>Sarking torn/damaged</option>\r\n<option>Roof insulation poorly installed</option>\r\n<option>Missing support where previous load bearing wall</option>\r\n<option>Damaged timbers</option>\r\n<option>Damaged A/C ducting</option>\r\n<option>Roof insulation installed over electrical fittings</option>\r\n<option>Downward pressure trusses</option>\r\n<option>Fretting Terra cotta tiles</option>\r\n<option>Firewall not installed</option>\r\n<option>Delignification</option>\r\n<option>Termite damage</option></select><textarea data-ref="RoofspaceNote"></textarea>'),
(45, 1, 49, 'Roof Space Information', 'Q8', 'H', '<select data-ref="RoofspaceInfo" multiple="multiple">\r\n<option>Trussed roof</option>\r\n<option>Cut roof</option>\r\n<option>Flat roof</option>\r\n<option>Vaulted roof</option>\r\n<option>Skillion roof</option></select>\r\n<select data-ref="RoofspaceInfo2" multiple="multiple">\r\n<option>Insulation</option>\r\n<option>Sarking</option>\r\n<option>A/C Ducting</option>\r\n<option>Bonded Blanket</option>\r\n<option>Disused hot water service</option></select><textarea data-ref="RSInfoNote"></textarea>'),
(46, 1, 49, 'Roof Space Borer', 'Q101', 'H', '<label><input type="checkbox" data-ref="RoofspaceBorer" />Lyctus borer</label><textarea data-ref="RSBorerNote"></textarea>'),
(47, 1, 50, 'Roof Exterior', NULL, 'H', '<select data-ref="Roofext" multiple="multiple"><option>Pitched roof appears minimal</option><option>Roof tiles cracked</option><option>Roof tiles missing</option><option>Loose roof tiles</option><option>Mortar loss ridge capping</option><option>Mortar loss verge tiles</option><option>Damage to ridge capping</option><option>Sheeting damaged</option><option>Sheeting signs of rusting</option><option>Sheeting rusting</option><option>Flashing split</option><option>Flashing dislodged</option><option>Flashing not installed</option><option>Guttering rusting</option><option>Downpipes rusting</option><option>Valley rusting</option><option>Skylight casing rusting</option><option>Rusting chimney</option><option>Guttering sagging</option><option>Guttering leaking at joins</option><option>Downpipes leaking at joins</option><option>Guttering damaged</option><option>Guttering missing</option><option>Downpipe damaged</option><option>Insufficient downpipes for length of gutter</option><option>Damaged SW</option><option>Downpipe not connected SW</option><option>Downpipe not adequately connected to SW</option><option>Rot damage/damage to eaves fascia/barge boards</option><option>Water stains to eaves linings</option><option>Damaged eaves linings</option></select><textarea data-ref="RoofextNote"></textarea>'),
(48, 1, 50, 'Roof Exterior Information', 'Q8', 'H', '<select data-ref="REInfo" multiple="multiple"><option>Cement tiles</option><option>Terra Cotta</option><option>Metal sheeting</option><option>Fibro sheeting</option><option>Slate</option><option>Shingles</option></select><select data-ref="REInfo2" multiple="multiple"><option>Roof / guttering clean</option><option>Skylight installed</option><option>TV antennae anchor bolts</option><option>Solar panels</option></select><textarea data-ref="REInfoNote"></textarea>'),
(49, 1, 51, 'Car', NULL, 'H', '<select data-ref="Car" multiple="multiple"><option>Garage poor condition</option><option>Carport poor condition</option><option>Cracked glass window</option><option>Cladding damaged</option><option>Cladding missing</option><option>Damaged rubber trims</option><option>Impact damage garage door</option><option>Damaged door</option><option>High external ground level</option><option>Rising damp at walls</option><option>Rot damage to</option><option>Damaged framework</option><option>Wall frame nogging missing</option><option>Garage roof damaged</option><option>Carport roof damaged</option><option>Rusting roof ridge capping</option><option>Garage roof rusting</option><option>Carport roof rusting</option><option>Guttering rusting</option><option>Guttering sagging</option><option>Guttering leaking at joins</option><option>Downpipe leaking at joins</option><option>Guttering damaged</option><option>Downpipe damaged</option><option>Guttering not installed</option><option>Downpipe not installed</option><option>Damaged SW</option><option>Downpipe not connected SW</option><option>Downpipe not adequately connected to SW</option><option>Rot damage to eaves fascia/barge boards</option><option>Damage to eaves fascia/barge boards</option><option>Water stains to eaves linings</option><option>Damaged eaves linings</option><option>Termite damage</option></select><textarea data-ref="CarNote"></textarea>'),
(50, 1, 51, 'Car Information', 'Q8', 'H', '<select data-ref="CarInfo" multiple="multiple"><option>GUMR</option><option>CUMR</option><option>attached garage</option><option>attached carport</option><option>Garage under building</option><option>FS Brick garage</option><option>FS Fibro garage</option><option>FS Metal garage</option><option>FS carport</option></select><textarea data-ref="CarInfoNote"></textarea>\r\n<label><input type="checkbox" data-ref="CarGutter" />Roof / guttering clean</label>&nbsp;<label><input type="checkbox" data-ref="CarSlab" />Drill hole marks slab floor</label>'),
(51, 1, 52, 'Retaining Wall', NULL, 'H', '<select data-ref="RetWall" multiple="multiple"><option>Masonry brick</option><option>Treated log/sleeper</option><option>Hardwood sleeper</option><option>Crib block</option><option>Bush rock</option><option>Sandstone</option><option>Concrete block</option><option>Retaining wall not constructed</option><option>Cracking/rotation</option><option>Rotation</option><option>Rot damage</option><option>Damage to wall</option><option>Efflorescence at wall</option><option>Termite damage</option></select><textarea data-ref="RetWallNote"></textarea>'),
(52, 1, 52, 'Retaining Wall Advisory', 'Q4', 'H', '<label><input type="checkbox" data-ref="RetWallAdv" />Retaining wall over 1 m height requires structural engineer comment</label>'),
(53, 1, 53, 'Path/Driveway', NULL, 'H', '<select data-ref="Path" multiple="multiple"><option>Cracking/subsidence paths/driveway</option><option>Paths/driveway lifting due to tree roots</option><option>Subsidence in pavers</option></select><textarea data-ref="PathNote"></textarea>'),
(54, 1, 53, 'Path Information', 'Q8', 'H', '<label><input type="checkbox" data-ref="PathInfo" />Drill hole marks paths</label>'),
(55, 1, 54, 'Fences', NULL, 'H', '<select data-ref="Fence" multiple="multiple"><option>Fence leaning/showing damage</option><option>Fence rusting</option><option>Fence in poor condition</option><option>Pool gate not self-latching</option><option>Termite damage</option><option>Fence dented</option><option>Brick fence separation/rotation</option><option>Fence unstable</option><option>Pool fence in poor condition</option><option>Pool fence not constructed</option></select><textarea data-ref="FenceNote"></textarea>'),
(56, 1, 54, 'Fences Information', 'Q8', 'H', '<select data-ref="FenceInfo" multiple="multiple"><option>Colorbond</option><option>Timber</option><option>Cyclone</option><option>Mesh</option><option>Tubular</option><option>Brick</option><option>Thatched</option></select><textarea data-ref="FINote"></textarea>'),
(57, 1, 54, 'SWD', NULL, 'H', '<select data-ref="SWD" multiple="multiple"><option>Landscaping not completed</option><option>Dish drain not installed</option><option>Ponding water</option></select><textarea data-ref="SWDNote"></textarea>'),
(58, 1, 54, 'SWD Information', 'Q8', 'H', '<label><input type="checkbox" data-ref="SWDInfo" />Drain clean</label><textarea data-ref="SWDInfoNote"></textarea>'),
;

create or replace view `v_prop_types` as
select p.id, p.name, group_concat(concat(ptp.name,'(',ptp.id,')') separator ', ') as 'types'
  from prop     as p,
       propType as pt,
       prop     as ptp
 where p.id=pt.prop
   and pt.type=ptp.id
   and ptp.id not in (1,7)
 group by p.id, p.name;
 
/*
<select data-ref="Pergola" multiple="multiple">
<option></option>
</select><textarea data-ref="PergolaNote"></textarea>

PROPERTY PART TREE
	site
		building interior
			roof space
			bedroom (room)
				wall
				ceiling 
				window
				wet area
				smoke detector
				electrical
			kitchen (room)
				wall
				ceiling 
				window
				wet area
				smoke detector
				electrical
			bathroom (room)
				wall
				ceiling 
				window
				wet area
				smoke detector
				electrical
			plumbing
		building exterior
			roof
			pergola
			decks
				front (part of statement)
				left (part of statement) 
				right (part of statement)
				rear (part of statement)
			balconies
				front (part of statement)
				left  (part of statement)
				right (part of statement)
				rear (part of statement)
			external wall
				front (part of statement)
				left  (part of statement)
				right (part of statement)
				rear (part of statement)
			external window
				front (part of statement)
				left  (part of statement)
				right (part of statement)
				rear (part of statement)
		subfloor
		car accommodation
				wall
				ceiling 
				window
				wet area
				smoke detector
				electrical
		land
			paths
			fences
			retaining walls
			surface water drainage
 

<select data-ref="SWD" multiple="multiple">
<option>Landscaping not completed</option>	
<option>Dish drain not installed</option>	
<option>Ponding water</option>	
</select>
<textarea data-ref="SWDNote"></textarea>
*/