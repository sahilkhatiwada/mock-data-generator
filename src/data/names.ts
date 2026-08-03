/**
 * Name datasets for user generation.
 */

/** 200+ common first names (male and female combined). */
export const FIRST_NAMES: readonly string[] = [
  // Male
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
  'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry',
  'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory',
  'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler',
  'Aaron', 'Jose', 'Adam', 'Henry', 'Nathan', 'Douglas', 'Zachary',
  'Peter', 'Kyle', 'Walter', 'Ethan', 'Jeremy', 'Harold', 'Keith',
  'Christian', 'Roger', 'Noah', 'Gerald', 'Carl', 'Terry', 'Sean',
  'Austin', 'Arthur', 'Lawrence', 'Dylan', 'Jesse', 'Jordan', 'Bryan',
  'Billy', 'Joe', 'Bruce', 'Gabriel', 'Logan', 'Albert', 'Willie',
  'Alan', 'Juan', 'Wayne', 'Elijah', 'Randy', 'Roy', 'Vincent',
  'Ralph', 'Eugene', 'Russell', 'Bobby', 'Mason', 'Philip', 'Louis',
  // Female
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan',
  'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret',
  'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon',
  'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna',
  'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine',
  'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria',
  'Heather', 'Diane', 'Julie', 'Joyce', 'Victoria', 'Ruth', 'Virginia',
  'Lauren', 'Kelly', 'Christina', 'Joan', 'Evelyn', 'Judith', 'Andrea',
  'Hannah', 'Megan', 'Cheryl', 'Jacqueline', 'Martha', 'Madison', 'Olivia',
  'Gloria', 'Teresa', 'Sara', 'Janice', 'Ann', 'Kathryn', 'Alice',
  'Jean', 'Doris', 'Julia', 'Grace', 'Judy', 'Abigail', 'Marie',
  'Denise', 'Beverly', 'Amber', 'Theresa', 'Danielle', 'Marilyn', 'Diana',
  'Brittany', 'Natalie', 'Sophia', 'Rose', 'Isabella', 'Alexis', 'Kayla',
] as const;

/** 200+ common last names. */
export const LAST_NAMES: readonly string[] = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz',
  'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
  'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos',
  'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez',
  'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long',
  'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell',
  'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales',
  'Fisher', 'Vasquez', 'Simmons', 'Romero', 'Jordan', 'Patterson', 'Alexander',
  'Hamilton', 'Graham', 'Reynolds', 'Griffin', 'Wallace', 'Moreno', 'West',
  'Cole', 'Hayes', 'Bryant', 'Herrera', 'Gibson', 'Ellis', 'Tran',
  'Medina', 'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro', 'Marshall',
  'Owens', 'Harrison', 'Fernandez', 'McDonald', 'Woods', 'Washington', 'Kennedy',
  'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman', 'Webb', 'Tucker',
  'Guzman', 'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter',
  'Gordon', 'Mendez', 'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon',
  'Munoz', 'Rose', 'Obrien', 'Spencer', 'Pierce', 'Floyd',
] as const;

/** Common email domains for realistic addresses. */
export const EMAIL_DOMAINS: readonly string[] = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'protonmail.com', 'aol.com', 'mail.com', 'zoho.com', 'fastmail.com',
  'example.com', 'test.com', 'email.com', 'inbox.com', 'live.com',
] as const;
