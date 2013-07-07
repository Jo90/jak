/* build.sql
*/

insert into usr select * from jakOld.usr;

insert into location select * from jakOld.location;

insert into address select * from jakOld.address;

insert into dbTable (name) select table_name from information_schema.tables where table_schema='jak';

delete from `qa`;
delete from `prop`;
delete from `propType`;
delete from `propChild`;

INSERT INTO `prop` (id, name) VALUES
(1, 'type'),
(2, 'site'),
(3, 'building'),
(4, 'land'),
(5, 'room'),
(6, 'wet area'),
(7, 'room component'),
(8, 'exterior'),
(9, 'roof'),
(10,'substrate');

INSERT INTO `propType` (prop, type) select id, 1 from prop;

INSERT INTO `prop` (id, name) VALUES
(21, 'wall'),
(22, 'ceiling'),
(23, 'floor'),
(24, 'door'),
(25, 'window');

INSERT INTO `propType`(`prop`, `type`) select id, 7 from prop where id between 21 and 25;

INSERT INTO `prop` (id, name) VALUES
(31, 'site'),
(32, 'building'),
(33, 'land'),
(34, 'bedroom'),
(35, 'bathroom'),
(36, 'lounge'),
(37, 'kitchen'),
(38, 'roof'),
(39, 'substrate');

INSERT INTO `propType` (`prop`, `type`) VALUES
(31, 2),
(32, 3),
(33, 4),
(34, 5),
(35, 5),
(35, 6),
(36, 5),
(37, 5),
(38, 9),
(39, 10);

INSERT INTO `propChild` (`prop`, `child`) VALUES
(2, 3),
(2, 4),
(3, 5),
(3, 8),
(3, 9),
(3, 10),
(5, 7);

INSERT INTO `qa` (`type`, `code`) VALUES
('G', 'Defect Minor'),
('G', 'Defect Major'),
('G', 'Cracking'),
('G', 'Advisory'),
('G', 'Safety'),
('G', 'Obstruction'),
('G', 'Inaccessible'),
('G', 'Information');



create or replace view `v_prop_types` as
select p.id, p.name, group_concat(concat(ptp.name,'(',ptp.id,')') separator ', ') as 'types'
  from prop     as p,
       propType as pt,
       prop     as ptp
 where p.id=pt.prop
   and pt.type=ptp.id
   and ptp.id not in (1,7)
 group by p.id, p.name;
