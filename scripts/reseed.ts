import 'dotenv/config';
import { Pool } from 'pg';

const csvData = `Timestamp,Names,Class,Email,Gender
2/26/2026 21:13:42,ISINGIZWE KWIZERA BLAISE,YEAR 1B,blaisekwizera31@gmail.com,MAN
2/26/2026 21:14:13,Raphael nibishaka,YEAR 3C,raphaelnibishaka@gmail.com,MAN
2/26/2026 21:14:20,MUNEZA Jean Dieudonne,YEAR 3B,munezadieudonne2021@gmail.com,MAN
2/26/2026 21:14:35,UHIRIWE Chrisostom,YEAR 2C,uhiriwechrisostom0@gmail.com,MAN
2/26/2026 21:14:56,MUNEZERO Alpha,YEAR 1A,alphamnzr@gmail.com,MAN
2/26/2026 21:14:58,NEZA SHIMA Niel Yvan,YEAR 1B,nezaniel2@gmail.com,MAN
2/26/2026 21:14:59,Kayiranga Simbi Kelia,YEAR 2B,simbikelia@gmail.com,WOMAN
2/26/2026 21:15:07,Hashimweyesu Jean de Dieu,YEAR 1A,hashimweyesujeandedie@gmail.com,MAN
2/26/2026 21:15:10,NDUWINGOMA Marie Ange Gabriella,YEAR 3A,angegaby200@gmail.com,WOMAN
2/26/2026 21:15:28,MANZI SHIMWA Yves Seraphin,YEAR 1B,myvesseraphin@gmail.com,MAN
2/26/2026 21:15:42,ISHIMWE GIHOZO Amanda,YEAR 1B,amandagihozoishimwe@gmail.com,WOMAN
2/26/2026 21:15:53,HITAYEZU Frank Duff,YEAR 2A,hitayezufrank@gmail.com,MAN
2/26/2026 21:15:56,UWIMANIKUNDA Patrick,YEAR 1B,patrickuwimanikunda@gmail.com,MAN
2/26/2026 21:15:58,NIYOBYOSE Isaac Precieux,YEAR 2C,isaprecieux112@gmail.com ,MAN
2/26/2026 21:16:17,IGIHOZO Sandra,YEAR 1A,qihesandrai1@gmail.com,WOMAN
2/26/2026 21:16:23,Komezusenge Bolice,YEAR 1A,komezusengebolce@gmail.com,MAN
2/26/2026 21:16:23,SANGWA Marius,Y1 c,mariussangwa@gmail.com,MAN
2/26/2026 21:16:47,IMANISINGIZWE KAMANA Adeodatus Clare,YEAR 2B,ckckclare@gmail.com,MAN
2/26/2026 21:16:50,ASIFIWE MUCYO Pacifique,YEAR 1B,mucyoasifiwe80@gmail.com,MAN
2/26/2026 21:16:50,Alliance Bienvenue,YEAR 2A,bienvenuealliance@gmail.com,MAN
2/26/2026 21:17:27,GANZA Gloria Fides,YEAR 1B,ganzagloriafides@gmail.com,WOMAN
2/26/2026 21:17:33,NGANJI Heaven's,YEAR 1A,heavensnganji@gmail.com,MAN
2/26/2026 21:17:36,NDIKUBWIMANA Melanie,YEAR 1A,melaniendikubwimana@gmail.com,WOMAN
2/26/2026 21:17:41,IHOZO Raissa Flora,YEAR 1A,floraihozoraissa@gmail.com,WOMAN
2/26/2026 21:17:46,SHIMIRWA TETA Sonia,YEAR 1B,shimirwasonia5@gmail.com,WOMAN
2/26/2026 21:17:59,Don Durkheim,YEAR 2A,dondurkheim13@gmail.com,MAN
2/26/2026 21:18:16,Hope Vanessa Zawadi,YEAR 1B,hopevzawadii@gmail.com,WOMAN
2/26/2026 21:19:02,Mushimiyimana Henriette,YEAR 2C,henriettemayor@gmail.com,WOMAN
2/26/2026 21:20:03,IGIRANEZA Joseph,YEAR 1B,igiranezajoseph50@gmail.com,MAN
2/26/2026 21:20:10,UWASE UTUJE Sandrine,YEAR 2B,utujesandrine456@gmail.com,WOMAN
2/26/2026 21:22:58,Rukundo Furaha Divin,YEAR 2C,rukundof993@gmail.com,MAN
2/26/2026 21:25:02,UWUMUREMYI Albert,YEAR 1C,uwumuremyialbert5@gmail.com,MAN
2/26/2026 21:27:48,Ganza Muganamfura Chaste,YEAR 1B,gchaste23@gmail.com,MAN
2/26/2026 21:28:23,WIHOGORA Florissa,YEAR 2B,wihogoraflorissa@gmail.com,WOMAN
2/26/2026 21:29:19,MUTIMUTUJE Hope,YEAR 1B,mutimutujehope90@gmail.com,WOMAN
2/26/2026 21:31:01,Nkunda Isabella,YEAR 2C,nkundabella2@gmail.com,WOMAN
2/26/2026 21:31:40,umuhire liza belinda,YEAR 1B,umuhirebelinda@gmail.com,WOMAN
2/26/2026 21:31:43,KALIZA Esther,YEAR 2B,kalizaesther5@gmail.com,WOMAN
2/26/2026 21:33:09,ISHIMWE NZIZA Ange,YEAR 2B,ishimwenzizaangell@gmail.com,WOMAN
2/26/2026 21:48:39,NIYIGENA Dorcas,YEAR 1C,niyigenadorcas9@gmail.com,WOMAN
2/26/2026 21:48:40,NSHUTI Mulindwa Christian,YEAR 2A,chrisnshuti943@gmail.com,MAN
2/26/2026 21:51:58,Peace INGABIRE,YEAR 1B,peaceinga777@gmail.com,WOMAN
2/26/2026 21:52:29,AHIMBAZWE MPUHWE Divine Nikita,YEAR 2A,mpuhwenikita@gmail.com,WOMAN
2/26/2026 21:54:06,USANASE Nice Josiane,YEAR 3A,usanasenicejosiane@gmail.com,WOMAN
2/26/2026 21:57:06,Irakoze Mukama Zion Eloheeka,YEAR 2A,m.eloheeka12@gmail.com,WOMAN
2/26/2026 22:04:09,IGIRIMPUHWE Noah,YEAR 2A,igirimpuhwenoah68@gmail.com,MAN
2/26/2026 22:16:00,BANA Emmy Tresor,YEAR 2A,tresorbana77@gmail.com,MAN
2/26/2026 22:22:37,TETA Angel Bless,YEAR 2C,tetaangelbless014@gmail.com,WOMAN
2/26/2026 22:50:42,Rutaganira Yanis Ntwali,YEAR 2A,ntwaliyanis@gmail.com,MAN
2/26/2026 23:09:46,Bruce NIBEZA MUGISHA,YEAR 1B,mnibeza23@gmail.com,MAN
2/27/2026 7:20:05,UMURERWA AMELIE GIFT,YEAR 1A,giftamelie@gmail.com,WOMAN
2/27/2026 7:34:20,ASINGIZWE Benite,YEAR 3D,beniteasingizwe@gmail.com,WOMAN
2/27/2026 7:40:08,SHAMI HIMBAZA Paradie Emmanuella,YEAR 3A,emmenuellaparadie@gmail.com,WOMAN
2/27/2026 7:41:32,MICOMYIZA Bonte,YEAR 1B,micomyizabonte4@gmail.com,WOMAN
2/27/2026 7:45:06,BYIRINGIRO Emmanuel,YEAR 2A,emmabyiringiro215@gmail.com,MAN
2/27/2026 7:48:23,BYIRINGIRO Samuel,YEAR 2A,byiringirosamuel533@gmail.com,MAN
2/27/2026 7:55:16,BUGINGO Eric Derick,YEAR 2A,bugingoderer@gmail.com,MAN
2/27/2026 8:20:14,Mwizerwa Sano Angella,YEAR 1B,sanoangella9@gmail.com,WOMAN
2/27/2026 8:36:51,NISHIMWE Umutoniwase Divine,YEAR 3A,umutoniwasenishimwedivine@gmail.com,WOMAN
2/27/2026 8:38:34,Eunice Atete KABUNDI,YEAR 1A,euniceatete0@gmail.com,WOMAN
2/27/2026 8:40:07,IHIRWE Celia Joy,YEAR 1A,joyihirwecelia@gmail.com,WOMAN
2/27/2026 8:54:48,Munezero Impano Christella,YEAR 2B,christellamunezeroimpano@gmail.com,WOMAN
2/27/2026 9:02:13,NIYOGUSHIMWA Honore,YEAR 1C,honoreniyogushimwa63@gmail.com,MAN
2/27/2026 9:06:17,IMPANO UMUHOZA Hope,YEAR 1C,umuhozahope5@gmail.com,WOMAN
2/27/2026 10:46:57,TURINUMUGISHA Gasore Corene,YEAR 3D,corenegasore@gmail.com,WOMAN
2/27/2026 12:53:44,IZERE Anna,YEAR 2B,izereanne0@gmail.com,WOMAN
2/27/2026 14:29:48,MIZERO Anne Line,YEAR 1C,lineanne65@gmail.com,WOMAN
2/27/2026 14:30:07,Jane BATAKARIZA,YEAR 1C,janebatakariza@gmail.com,WOMAN
2/27/2026 15:19:20,NIYOMPUHWE Robert,YEAR 1A,robertniyompuhwe@gmail.com,MAN
2/27/2026 16:10:10,Tesi Tracy,YEAR 3A,tracytesi69@gmail.com,WOMAN
3/2/2026 18:13:28,IZERE Joshua,YEAR 2B,izerejoshua94@gmail.com,MAN
      19/3/2026 08:40,KIREZI Livia,YEAR 3,kirezilivia@gmail.com,WOMAN
       19/3/2026 08:40,IRISHYURA Yedidiah,YEAR 1,futureksmeyedidiah@gmail.com,MAN
       19/3/2026 08:52,IZERE Louise,YEAR 2B,louiseizere1@gmail.com,WOMAN
      19/3/2026 08:52,ISEZERANO Forever Hyacinthe,YEAR 1,foreverhyacinthe@gmail.com,MAN
      19/3/2026 09:00,ISHIMWE Rocky,YEAR 1C,rockyishimwe9@gmail.com,MAN
      19/3/2026 09:00,RUKUNDO Benise,YEAR 2B,gihozoRukundobenise@gmail.com,WOMAN
  19/3/2026 09:10,KENDY Neilla Gisa,YEAR 3A,kendyneilla@gmail.com,WOMAN
  19/3/2026 09:15,Ntwali Sasha,YEAR 2C,sashantwali@gmail.com,WOMAN
 19/3/2026 09:16,UWASE Sonia,YEAR 2A,uwasesonia43@gmail.com,WOMAN
19/3/2026 09:17,MUHIRWA Reine Kheira,YEAR 3C,reinekheira2023@gmail.com,WOMAN
19/3/2026 09:22,UMUHOZA ISHIMWE Henriette,YEAR 1C,uhenriette88@gmail.com,WOMAN
19/3/2026 09:25,CYUSA SHAMI Adelin,YEAR 1C,shamicyusa2010@gmail.com,MAN
19/3/2026 09:27,NDANYUZWE UHIRWA SHAMI Melissa,YEAR 2B,uhirwamelissa@gmail.com,MAN
19/3/2026 09:30,NIYOMUGABO Dan Christian,YEAR 1A,danchristianniyomugabo@gmail.com,MAN
19/3/2026 09:30,IRIBAGIZA Fanny,YEAR 2C,iribagizafanny3@gmail.com,WOMAN
19/3/2026 09:52,Ishema Gurnaud,YEAR 1A,ishemagurnaud0@gmail.com,MAN
19/3/2026 10:11,KEZA Delice,YEAR 2C,delicekeza0@gmail.com,MAN
  19/3/2026 10:20,TUYUBAHE Edouard,YEAR 2C,edouardtuyubahe@gmail.com,MAN
19/3/2026 11:04,Irakoze Prince Bonheur,YEAR 2A,irakozep03@gmail.com,MAN
19/3/2026 11:04,Prince NTARE KAYITARE,YEAR 3,ntarekayitare@gmail.com,MAN`;

const techBooks = [
  { title: "Clean Code", writer: "Robert C. Martin", subject: "Software Engineering", desc: "A Handbook of Agile Software Craftsmanship", isbn: "9780132350884" },
  { title: "Design Patterns", writer: "Erich Gamma", subject: "Software Engineering", desc: "Elements of Reusable Object-Oriented Software", isbn: "9780201633610" },
  { title: "Introduction to Algorithms", writer: "Thomas H. Cormen", subject: "Computer Science", desc: "A comprehensive update of the leading algorithms text", isbn: "9780262033848" },
  { title: "The Pragmatic Programmer", writer: "Andrew Hunt", subject: "Software Engineering", desc: "Your journey to mastery", isbn: "9780135957059" },
  { title: "Structure and Interpretation of Computer Programs", writer: "Harold Abelson", subject: "Computer Science", desc: "Classic text on functional programming and language design", isbn: "9780262510875" },
  { title: "Cracking the Coding Interview", writer: "Gayle Laakmann McDowell", subject: "Computer Science", desc: "189 Programming Questions and Solutions", isbn: "9780984782857" },
  { title: "Refactoring", writer: "Martin Fowler", subject: "Software Engineering", desc: "Improving the Design of Existing Code", isbn: "9780134757599" },
  { title: "Computer Networking: A Top-Down Approach", writer: "James Kurose", subject: "Computer Networking", desc: "Internet concepts down to the application layer", isbn: "9780133594140" },
  { title: "Operating System Concepts", writer: "Abraham Silberschatz", subject: "Computer Science", desc: "Foundational principles of operating systems", isbn: "9781118063330" },
  { title: "Artificial Intelligence: A Modern Approach", writer: "Stuart Russell", subject: "Artificial Intelligence", desc: "The definitive guide to AI", isbn: "9780134610993" }
];

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // 1. Alter Schema implicitly to be safe incase UI changes didn't run
    await pool.query(\`
      ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'Student';
      ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT '';
    \`);

    // 2. Wipe existing borrowers entirely
    await pool.query('DELETE FROM borrowers');
    console.log('Wiped previous dummy borrowers.');

    // 3. Process CSV
    const rows = csvData.trim().split('\\n').slice(1);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      let studentIdVal = 2400; // LSM start
      
      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i].trim();
        if (!rowData) continue;
        
        let cols = rowData.split(',');
        // For some data, the date might have commas. Assuming no inner commas based on sample.
        if (cols.length < 5) continue;
        // cols: Timestamp,Names,Class,Email,Gender
        const admissionDate = cols[0].trim().split(' ')[0]; // Approx
        const names = cols[1].trim();
        const parts = names.split(' ');
        const first = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
        const last = parts.slice(Math.ceil(parts.length / 2)).join(' ');
        
        const rawClass = cols[2].trim().toUpperCase(); // "YEAR 1B"
        let classLevel = rawClass;
        let stream = '';
        if (rawClass.includes(' ')) {
           classLevel = rawClass.split(' ')[0] + ' ' + rawClass.split(' ')[1].slice(0, 1);
           stream = rawClass.slice(-1);
           if (!/[A-Z]/.test(stream)) stream = '';
        }
        
        const email = cols[3].trim();
        const gender = cols[4].trim();
        
        const roll = \`A\${2000 + i}\`;
        const studentId = \`LSM-\${++studentIdVal}\`;
        
        const role = rawClass.includes('TEACHER') || rawClass.includes('PROF') ? 'Teacher' : 'Student';

        await client.query(
          \`
          INSERT INTO borrowers (
            full_name, first_name, last_name, class_level, stream_name, class_name, roll,
            student_id, admission_date, primary_phone, primary_email, address,
            borrow_score, lifetime_borrowed, total_fines_paid_rwf, total_fines_owed_rwf, is_selected, role, gender
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, '',
            0, 0, 0, 0, FALSE, $11, $12
          )
          \`,
          [
            names, first || 'Unknown', last || 'Unknown', classLevel, stream, rawClass, roll,
            studentId, '', email, role, gender
          ]
        );
      }
      
      console.log(\`Inserted \${rows.length} new borrowers.\`);
      
      // 4. Insert Tech Books
      let bookCodeStart = 1000;
      for (const b of techBooks) {
         const code = \`BK-CS-\${++bookCodeStart}\`;
         const insertBook = await client.query(
           \`INSERT INTO books (
              title, subtitle, writer, book_id, subject, class_name, publish_date,
              cover, detail_cover, summary, dewey_decimal, publisher, language, pages, isbn13, total_copies
            ) VALUES (
              $1, '', $2, $3, $4, 'Computer Science', NOW(),
              '', '', $5, '005.1', 'Tech Press', 'English', 350, $6, 3
            ) RETURNING id\`,
           [b.title, b.writer, code, b.subject, b.desc, b.isbn]
         );
         
         const newId = insertBook.rows[0].id;
         for (let c = 0; c < 3; c++) {
            await client.query(
              \`INSERT INTO book_copies (book_id, copy_code, status, fine_rwf)
               VALUES ($1, $2, 'Available', 0)\`,
               [newId, \`\${code}-\${String.fromCharCode(65 + c)}\`]
            );
         }
      }
      console.log(\`Inserted \${techBooks.length} CS books + 3 copies each.\`);
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    
  } finally {
    pool.end();
  }
}

run().catch(console.error);
