import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

try {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...val] = trimmed.split('=')
      if (key && val.length) {
        process.env[key.trim()] = val.join('=').trim()
      }
    }
  }
} catch {
  // ignore
}

const supabaseUrl = process.env.SUPABASE_URL
if (!supabaseUrl) {
  console.error('SUPABASE_URL environment variable is required')
  process.exit(1)
}
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('SUPABASE_SECRET_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PAKISTANI_TEACHERS = [
  { name: 'Sir Ahmed Khan', empNo: 'EMP-100001', qual: 'M.A. English, B.Ed', joining: '2021-08-15', email: 'ahmed.khan@ngoschool.org.pk' },
  { name: 'Miss Fatima Zahra', empNo: 'EMP-100002', qual: 'M.Sc Mathematics', joining: '2022-01-10', email: 'fatima.zahra@ngoschool.org.pk' },
  { name: 'Miss Ayesha Noor', empNo: 'EMP-100003', qual: 'B.Ed Elementary Education', joining: '2022-03-01', email: 'ayesha.noor@ngoschool.org.pk' },
  { name: 'Sir Bilal Ahmed', empNo: 'EMP-100004', qual: 'M.Sc Computer Science', joining: '2021-09-01', email: 'bilal.ahmed@ngoschool.org.pk' },
  { name: 'Sir Muhammad Usman', empNo: 'EMP-100005', qual: 'M.A. Urdu & Islamic Studies', joining: '2020-11-15', email: 'muhammad.usman@ngoschool.org.pk' },
  { name: 'Miss Hira Ali', empNo: 'EMP-100006', qual: 'B.Sc General Science', joining: '2023-01-15', email: 'hira.ali@ngoschool.org.pk' },
  { name: 'Sir Tariq Mehmood', empNo: 'EMP-100007', qual: 'M.A. Islamiyat', joining: '2019-04-01', email: 'tariq.mehmood@ngoschool.org.pk' },
  { name: 'Miss Sadia Zainab', empNo: 'EMP-100008', qual: 'B.Ed Early Childhood Learning', joining: '2023-08-10', email: 'sadia.zainab@ngoschool.org.pk' },
  { name: 'Sir Kamran Raza', empNo: 'EMP-100009', qual: 'M.Sc Physics', joining: '2021-02-01', email: 'kamran.raza@ngoschool.org.pk' },
  { name: 'Miss Maryam Bibi', empNo: 'EMP-100010', qual: 'B.A. Fine Arts & Pedagogy', joining: '2022-09-15', email: 'maryam.bibi@ngoschool.org.pk' },
  { name: 'Sir Faisal Shah', empNo: 'EMP-100011', qual: 'B.Sc Chemistry', joining: '2023-03-01', email: 'faisal.shah@ngoschool.org.pk' },
  { name: 'Miss Rabia Yasmin', empNo: 'EMP-100012', qual: 'M.A. History & Social Studies', joining: '2020-08-01', email: 'rabia.yasmin@ngoschool.org.pk' },
]

const PAKISTANI_ADDRESSES = [
  'House #14, Street 5, Sector B, Johar Town, Lahore',
  'Flat 302, Al-Madina Heights, Gulberg III, Lahore',
  'House #88, Block 4, Model Town, Lahore',
  'Plot 12, Main Bazaar, Faisal Town, Lahore',
  'House #45-A, Cavalry Ground, Lahore Cantt',
  'House #21, Lane 3, Allama Iqbal Town, Lahore',
  'Quarter 18, NGO Colony, Township, Lahore',
  'House #9, Street 12, Mughalpura, Lahore',
  'House #33, Block C, Garden Town, Lahore',
  'House #72, Muslim Town, Wahdat Road, Lahore',
]

const BLOOD_GROUPS = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']

const PAKISTANI_PARENTS = [
  { father: 'Muhammad Imran', mother: 'Sadia Imran', occF: 'Shopkeeper', occM: 'Housewife', phone: '+923001112233', email: 'imran.family@example.com' },
  { father: 'Muhammad Asif', mother: 'Uzma Asif', occF: 'Electrician', occM: 'Tailor', phone: '+923012223344', email: 'asif.family@example.com' },
  { father: 'Khalid Mehmood', mother: 'Rabia Khalid', occF: 'Government Servant', occM: 'Housewife', phone: '+923023334455', email: 'khalid.family@example.com' },
  { father: 'Tariq Mehmood', mother: 'Saima Tariq', occF: 'Private Driver', occM: 'Housewife', phone: '+923034445566', email: 'tariq.family@example.com' },
  { father: 'Faisal Shah', mother: 'Nazia Faisal', occF: 'Accountant', occM: 'School Teacher', phone: '+923045556677', email: 'faisal.family@example.com' },
  { father: 'Kamran Raza', mother: 'Bushra Kamran', occF: 'Sales Manager', occM: 'Housewife', phone: '+923056667788', email: 'kamran.family@example.com' },
  { father: 'Noman Ali', mother: 'Samina Noman', occF: 'Mechanic', occM: 'Housewife', phone: '+923067778899', email: 'noman.family@example.com' },
  { father: 'Babar Azam', mother: 'Hina Babar', occF: 'Business Man', occM: 'Housewife', phone: '+923078889900', email: 'babar.family@example.com' },
  { father: 'Kashif Mehmood', mother: 'Sobia Kashif', occF: 'Bank Officer', occM: 'Doctor', phone: '+923089990011', email: 'kashif.family@example.com' },
  { father: 'Adnan Sami', mother: 'Zoya Adnan', occF: 'Graphic Designer', occM: 'Housewife', phone: '+923090001122', email: 'adnan.family@example.com' },
  { father: 'Rashid Khan', mother: 'Fariha Rashid', occF: 'Contractor', occM: 'Housewife', phone: '+923101112233', email: 'rashid.family@example.com' },
  { father: 'Zubair Ahmed', mother: 'Tehreem Zubair', occF: 'Civil Engineer', occM: 'Teacher', phone: '+923112223344', email: 'zubair.family@example.com' },
  { father: 'Shahid Iqbal', mother: 'Kanwal Shahid', occF: 'Pharmacist', occM: 'Housewife', phone: '+923123334455', email: 'shahid.family@example.com' },
  { father: 'Waseem Akram', mother: 'Shazia Waseem', occF: 'Police Officer', occM: 'Housewife', phone: '+923134445566', email: 'waseem.family@example.com' },
  { father: 'Nabeel Qureshi', mother: 'Mehwish Nabeel', occF: 'Software Engineer', occM: 'Lecturer', phone: '+923145556677', email: 'nabeel.family@example.com' },
  { father: 'Sajid Ali', mother: 'Anum Sajid', occF: 'Plumber', occM: 'Housewife', phone: '+923156667788', email: 'sajid.family@example.com' },
  { father: 'Hamza Farooq', mother: 'Amna Hamza', occF: 'Architect', occM: 'Housewife', phone: '+923167778899', email: 'hamza.family@example.com' },
  { father: 'Usman Ghani', mother: 'Maria Usman', occF: 'Real Estate Agent', occM: 'Housewife', phone: '+923178889900', email: 'usman.family@example.com' },
  { father: 'Rizwan Ahmed', mother: 'Mahnoor Rizwan', occF: 'Textile Merchant', occM: 'Housewife', phone: '+923189990011', email: 'rizwan.family@example.com' },
  { father: 'Bilal Hassan', mother: 'Zainab Bilal', occF: 'Journalist', occM: 'Teacher', phone: '+923190001122', email: 'bilal.family@example.com' },
]

const STUDENT_NAMES = [
  // KG1 (14 students)
  { name: 'Muhammad Ali', gender: 'male', dob: '2021-05-10' },
  { name: 'Ahmed Raza', gender: 'male', dob: '2021-08-14' },
  { name: 'Fatima Noor', gender: 'female', dob: '2021-03-22' },
  { name: 'Ayesha Khan', gender: 'female', dob: '2021-06-18' },
  { name: 'Zain Ali', gender: 'male', dob: '2021-09-05' },
  { name: 'Abdullah', gender: 'male', dob: '2021-01-30' },
  { name: 'Hassan', gender: 'male', dob: '2021-04-12' },
  { name: 'Maryam', gender: 'female', dob: '2021-11-25' },
  { name: 'Areeba', gender: 'female', dob: '2021-07-19' },
  { name: 'Usman', gender: 'male', dob: '2021-02-14' },
  { name: 'Huzaifa', gender: 'male', dob: '2021-10-08' },
  { name: 'Hamza', gender: 'male', dob: '2021-12-01' },
  { name: 'Noor Fatima', gender: 'female', dob: '2021-04-05' },
  { name: 'Iqra', gender: 'female', dob: '2021-05-28' },

  // KG2 (13 students)
  { name: 'Laiba', gender: 'female', dob: '2020-04-15' },
  { name: 'Anaya', gender: 'female', dob: '2020-07-20' },
  { name: 'Ibrahim', gender: 'male', dob: '2020-02-11' },
  { name: 'Mustafa', gender: 'male', dob: '2020-09-09' },
  { name: 'Khadija', gender: 'female', dob: '2020-01-25' },
  { name: 'Zaynab', gender: 'female', dob: '2020-06-14' },
  { name: 'Umar', gender: 'male', dob: '2020-10-30' },
  { name: 'Rayyan', gender: 'male', dob: '2020-03-03' },
  { name: 'Bilal', gender: 'male', dob: '2020-08-22' },
  { name: 'Eshal', gender: 'female', dob: '2020-11-18' },
  { name: 'Dua', gender: 'female', dob: '2020-05-06' },
  { name: 'Mahnoor', gender: 'female', dob: '2020-12-12' },
  { name: 'Bareerah', gender: 'female', dob: '2020-02-28' },

  // KG3 (13 students)
  { name: 'Muhammad Ahmed', gender: 'male', dob: '2019-05-14' },
  { name: 'Saad', gender: 'male', dob: '2019-08-20' },
  { name: 'Haris', gender: 'male', dob: '2019-01-10' },
  { name: 'Danial', gender: 'male', dob: '2019-09-15' },
  { name: 'Rohaan', gender: 'male', dob: '2019-04-04' },
  { name: 'Yahya', gender: 'male', dob: '2019-11-11' },
  { name: 'Arham', gender: 'male', dob: '2019-03-30' },
  { name: 'Shahzain', gender: 'male', dob: '2019-07-07' },
  { name: 'Manha', gender: 'female', dob: '2019-06-25' },
  { name: 'Hoorain', gender: 'female', dob: '2019-10-18' },
  { name: 'Bareera', gender: 'female', dob: '2019-02-14' },
  { name: 'Aleena', gender: 'female', dob: '2019-12-05' },
  { name: 'Hareem', gender: 'female', dob: '2019-04-29' },

  // Class 1 (14 students)
  { name: 'Kinza', gender: 'female', dob: '2018-05-01' },
  { name: 'Syeda Fatima', gender: 'female', dob: '2018-08-12' },
  { name: 'Syeda Ayesha', gender: 'female', dob: '2018-01-20' },
  { name: 'Muhammad Hassan', gender: 'male', dob: '2018-09-10' },
  { name: 'Muhammad Hussain', gender: 'male', dob: '2018-09-10' },
  { name: 'Zohaib', gender: 'male', dob: '2018-04-18' },
  { name: 'Moeez', gender: 'male', dob: '2018-11-05' },
  { name: 'Subhan', gender: 'male', dob: '2018-03-15' },
  { name: 'Zarrar', gender: 'male', dob: '2018-07-22' },
  { name: 'Affan', gender: 'male', dob: '2018-06-30' },
  { name: 'Hashim', gender: 'male', dob: '2018-10-14' },
  { name: 'Mirha', gender: 'female', dob: '2018-02-09' },
  { name: 'Jannat', gender: 'female', dob: '2018-12-24' },
  { name: 'Zoya', gender: 'female', dob: '2018-05-19' },

  // Class 2 (13 students)
  { name: 'Inaya', gender: 'female', dob: '2017-04-10' },
  { name: 'Anum', gender: 'female', dob: '2017-07-15' },
  { name: 'Haniya', gender: 'female', dob: '2017-01-28' },
  { name: 'Romaisa', gender: 'female', dob: '2017-09-02' },
  { name: 'Meerab', gender: 'female', dob: '2017-03-18' },
  { name: 'Yashfeen', gender: 'female', dob: '2017-11-12' },
  { name: 'Zayan', gender: 'male', dob: '2017-06-05' },
  { name: 'Rayan', gender: 'male', dob: '2017-08-21' },
  { name: 'Ayyan', gender: 'male', dob: '2017-02-14' },
  { name: 'Shanzay', gender: 'female', dob: '2017-10-09' },
  { name: 'Minahil', gender: 'female', dob: '2017-05-25' },
  { name: 'Fatima Tuz Zahra', gender: 'female', dob: '2017-12-01' },
  { name: 'Hafsa', gender: 'female', dob: '2017-04-30' },

  // Class 3 (13 students)
  { name: 'Ruqayyah', gender: 'female', dob: '2016-03-14' },
  { name: 'Sumayya', gender: 'female', dob: '2016-08-19' },
  { name: 'Asma', gender: 'female', dob: '2016-01-05' },
  { name: 'Sawera', gender: 'female', dob: '2016-09-22' },
  { name: 'Bisma', gender: 'female', dob: '2016-04-11' },
  { name: 'Tayyaba', gender: 'female', dob: '2016-11-28' },
  { name: 'Rimsha', gender: 'female', dob: '2016-06-16' },
  { name: 'Sidra', gender: 'female', dob: '2016-07-07' },
  { name: 'Kiran', gender: 'female', dob: '2016-02-20' },
  { name: 'Bushra', gender: 'female', dob: '2016-10-15' },
  { name: 'Nida', gender: 'female', dob: '2016-05-09' },
  { name: 'Saira', gender: 'female', dob: '2016-12-30' },
  { name: 'Maria', gender: 'female', dob: '2016-04-03' },
]

async function seed() {
  console.log('=== Seeding Enrollments for All 80 Students ===')

  const { data: school } = await supabase.from('schools').select('id').single()
  const { data: year } = await supabase.from('academic_years').select('id').eq('name', '2026-2027').single()
  const { data: classes } = await supabase.from('classes').select('id, name')
  const { data: sections } = await supabase.from('sections').select('id, class_id, name')
  const { data: students } = await supabase.from('students').select('id, full_name, student_number')

  if (!school || !year || !classes || !sections || !students) {
    throw new Error('Prerequisites missing')
  }

  const classMap: Record<string, string> = {}
  classes.forEach((c) => (classMap[c.name] = c.id))

  const sectionMap: Record<string, string> = {}
  sections.forEach((s) => (sectionMap[`${s.class_id}-${s.name}`] = s.id))

  const classList = ['KG1', 'KG2', 'KG3', 'Class 1', 'Class 2', 'Class 3']
  let seededEnrollments = 0

  await supabase.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    if (!student) continue

    const assignedClassName = classList[Math.floor(i / 13) % classList.length] ?? 'KG1'
    const assignedSecLetter = i % 2 === 0 ? 'A' : 'B'
    const classId = classMap[assignedClassName] ?? ''
    const sectionId = sectionMap[`${classId}-${assignedSecLetter}`] ?? ''
    const rollNo = (Math.floor(i / 2) % 15) + 1

    const { error } = await supabase.from('enrollments').insert({
      student_id: student.id,
      academic_year_id: year.id,
      class_id: classId,
      section_id: sectionId,
      roll_number: rollNo,
      status: 'active',
      start_date: '2026-04-01',
    })

    if (error) {
      console.error(`Enrollment failed for ${student.full_name}: ${error.message}`)
    } else {
      seededEnrollments++
    }
  }

  console.log(`[PASS] Successfully seeded ${seededEnrollments} active enrollments across 80 students!`)
}

seed().catch(console.error)
