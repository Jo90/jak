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
(40, 1, 47, 'Pergola', NULL, 'H', '<select data-ref="Pergola" multiple="multiple">\r\n<option>Pergola not in TLM</option>\r\n<option>Pergola undersized timbers</option>\r\n<option>Posts in contact with soil</option>\r\n<option>Rot damage to timbers</option>\r\n<option>Damage</option>\r\n</select><textarea data-ref="PergolaNote"></textarea>')
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
*/
 


