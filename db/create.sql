/* build.sql
*/

insert into usr select * from jakOld.usr;

insert into location select * from jakOld.location;

insert into address select * from jakOld.address;

insert into dbTable (name) select table_name from information_schema.tables where table_schema='jak';

delete from `prop`;
delete from `propType`;
delete from `propChild`;

INSERT INTO `prop` (id, type, name) VALUES
( 3, true, 'building interior'),
( 4, true, 'building exterior'),
( 5, true, 'room'),
( 6, true, 'wet area'),
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

INSERT INTO `propType` (`prop`, `type`) VALUES
(22, 3),(22, 4),
(24, 5),
(25, 5),(25, 6),
(26, 5),
(27, 5);

INSERT INTO `propChild` (`prop`, `child`) VALUES
(21, 22),(21, 23),
(3, 5),
(4, 46),
(5, 41),(5, 42),(5, 43),(5, 44),(5, 45)
;

delete from `qa`;
INSERT INTO `qa` (`id`, `seq`, `prop`, `name`, `rule`, `codeType`, `code`) VALUES
(1, 1, null, 'Defect Major', null, 'H', 'Defect Major <textarea data-ref="DMaj" placeholder="description"></textarea>'),
(2, 2, null, 'Defect Minor', null, 'H', 'Defect Minor <textarea data-ref="DMin" placeholder="description"></textarea>'),
(3, 4, null, 'Cracking', null, 'H', 'Cracking <textarea placeholder="description"></textarea>'),
(4, 4, null, 'Advisory', null, 'H', 'Advisory <textarea placeholder="description"></textarea>'),
(5, 5, null, 'Safety', null, 'H', 'Safety <select><option>note</option><option>warning</option><option>critical</option></select><textarea placeholder="description"></textarea>'),
(6, 6, null, 'Obstruction', null, 'H', 'Obstruction <textarea placeholder="description"></textarea>'),
(7, 7, null, 'Inaccessible', null, 'H', 'Inaccessible <textarea placeholder="description"></textarea>'),
(8, 3, null, 'Information', null, 'H', 'Information<select><option>General</option><option>Advisory</option><option>Future consideration</option></select>'),
(9, 99, null, 'Termites', null, 'H', 'Termite: <select class="ja-data-qa-termites"><option>Coptotermes</option><option>Schedorhinotermes</option><option>Nasutitermes</option><option>Heterotermes</option></select>&nbsp;<label><input type="checkbox"  class="ja-data-qa-termites-active" />Live/Active</label><label><input type="checkbox"  class="ja-data-qa-termites-nest" />Nest found</label> <textarea placeholder="notes"></textarea>'),
(10, 1, 44, 'Door', null, 'H', '<select><option>handle</option><option>out of square</option><option>missing/removed</option><option>not coated</option><option>other</option></select><textarea></textarea>'),
(11, 1, 45, 'Window', null, 'H', '<select><option>frame damage</option><option>cracked glass</option><option>other</option></select><textarea></textarea>'),
(12, 1, 43, 'Floor', null, 'H', '<select><option>carpeted</option><option>wooden</option><option>linoleum</option><option>other</option></select><textarea></textarea>'),
(13, 1, 43, 'Kitchen Floor', '27', 'H', 'Kitchen Floor <input type="text" placeholder="Kitchen Floor" />'),
(14, 1, 41, 'Building Wall', '22', 'H', 'Building Wall <select><option>Interior</option><option>Exterior</option></select>')
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