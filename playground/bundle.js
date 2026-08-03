(function (global) {
  'use strict';
  function createPRNG(seed) {
    let state = seed >>> 0;
    return function next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let z = (Math.imul(state ^ (state >>> 15), 1 | state)) >>> 0;
      z = (z ^ (z + Math.imul(z ^ (z >>> 7), 61 | z))) >>> 0;
      z = (z ^ (z >>> 14)) >>> 0;
      return z / 4294967296;
    };
  }

  function Random(seed) {
    this._seed = seed !== undefined ? seed : Math.floor(Math.random() * 2147483647);
    this._rng = createPRNG(this._seed);
  }

  Object.defineProperty(Random.prototype, 'seed', { get: function () { return this._seed; } });

  Random.prototype.float = function () { return this._rng(); };

  Random.prototype.int = function (min, max) {
    if (min > max) throw new RangeError('int(): min must be <= max');
    return Math.floor(this.float() * (max - min + 1)) + min;
  };

  Random.prototype.decimal = function (min, max, dp) {
    dp = dp !== undefined ? dp : 2;
    return parseFloat((this.float() * (max - min) + min).toFixed(dp));
  };

  Random.prototype.pick = function (arr) {
    if (!Array.isArray(arr) || arr.length === 0) throw new TypeError('pick(): needs non-empty array');
    return arr[this.int(0, arr.length - 1)];
  };

  Random.prototype.weightedPick = function (items) {
    if (!Array.isArray(items) || items.length === 0) throw new TypeError('weightedPick(): needs non-empty array');
    var total = items.reduce(function (s, i) { return s + i.weight; }, 0);
    var t = this.float() * total;
    for (var i = 0; i < items.length; i++) {
      t -= items[i].weight;
      if (t <= 0) return items[i].value;
    }
    return items[items.length - 1].value;
  };

  Random.prototype.bool = function (p) {
    return this.float() < (p !== undefined ? p : 0.5);
  };

  Random.prototype.shuffle = function (arr) {
    var result = arr.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = this.int(0, i);
      var tmp = result[i]; result[i] = result[j]; result[j] = tmp;
    }
    return result;
  };

  Random.prototype.sample = function (arr, n) {
    if (n > arr.length) throw new RangeError('sample(): n > array length');
    return this.shuffle(arr).slice(0, n);
  };

  Random.prototype.uuid = function () {
    var bytes = [];
    for (var i = 0; i < 16; i++) bytes.push(this.int(0, 255));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = bytes.map(function (b) { return b.toString(16).padStart(2, '0'); });
    return [hex.slice(0,4).join(''), hex.slice(4,6).join(''), hex.slice(6,8).join(''), hex.slice(8,10).join(''), hex.slice(10,16).join('')].join('-');
  };

  Random.prototype.date = function (start, end) {
    var s = new Date(start).getTime(), e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) throw new TypeError('date(): invalid dates');
    if (s > e) throw new RangeError('date(): start must be before end');
    return new Date(s + this.float() * (e - s));
  };

  Random.prototype.phone = function () {
    return '(555) ' + this.int(100, 999) + '-' + this.int(1000, 9999);
  };

  Random.prototype.zip = function (base) {
    return String(parseInt(base, 10) + this.int(0, 99)).padStart(5, '0');
  };

  Random.prototype.streetNumber = function () { return this.int(1, 9999); };

  // ── SeedManager ───────────────────────────────────────────────────────────

  function SeedManager() {
    this._instance = null;
    this._currentSeed = null;
  }

  SeedManager.prototype.init = function (seed) {
    var resolved = seed !== undefined ? seed : Math.floor(Math.random() * 2147483647);
    this._currentSeed = resolved;
    this._instance = new Random(resolved);
    return this._instance;
  };

  SeedManager.prototype.getInstance = function () {
    if (!this._instance) this.init();
    return this._instance;
  };

  SeedManager.prototype.getSeed = function () { return this._currentSeed; };
  SeedManager.prototype.reset = function () { this._instance = null; this._currentSeed = null; };

  SeedManager.prototype.createNamed = function (namespace) {
    var base = this._currentSeed !== null ? this._currentSeed : Math.floor(Math.random() * 2147483647);
    var hash = base;
    for (var i = 0; i < namespace.length; i++) {
      hash = (Math.imul(hash ^ namespace.charCodeAt(i), 0x9e3779b9) >>> 0);
      hash ^= hash >>> 16;
    }
    return new Random(hash >>> 0);
  };

  var seedManager = new SeedManager();
  var FIRST_NAMES = [
    'James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles',
    'Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua',
    'Kenneth','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan',
    'Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon',
    'Benjamin','Samuel','Raymond','Gregory','Frank','Alexander','Patrick','Jack','Dennis','Jerry',
    'Tyler','Aaron','Jose','Adam','Henry','Nathan','Douglas','Zachary','Peter','Kyle',
    'Walter','Ethan','Jeremy','Harold','Keith','Christian','Roger','Noah','Gerald','Carl',
    'Terry','Sean','Austin','Arthur','Lawrence','Dylan','Jesse','Jordan','Bryan','Logan',
    'Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen',
    'Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna',
    'Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia',
    'Kathleen','Amy','Angela','Shirley','Anna','Brenda','Pamela','Emma','Nicole','Helen',
    'Samantha','Katherine','Christine','Debra','Rachel','Carolyn','Janet','Catherine','Maria','Heather',
    'Diane','Julie','Victoria','Ruth','Virginia','Lauren','Kelly','Christina','Hannah','Megan',
    'Martha','Madison','Olivia','Teresa','Sara','Julia','Grace','Abigail','Marie','Natalie',
    'Sophia','Rose','Isabella','Alexis','Kayla'
  ];

  var LAST_NAMES = [
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
    'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
    'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
    'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
    'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
    'Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes',
    'Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper',
    'Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson',
    'Watson','Brooks','Chavez','Wood','Bennett','Gray','Mendoza','Ruiz','Hughes','Price',
    'Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell',
    'Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Fisher',
    'Vasquez','Simmons','Romero','Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds','Griffin',
    'Wallace','Moreno','West','Cole','Hayes','Bryant','Herrera','Gibson','Ellis','Tran',
    'Medina','Aguilar','Stevens','Murray','Ford','Castro','Marshall','Owens','Harrison','Fernandez',
    'Woods','Washington','Kennedy','Wells','Vargas','Henry','Chen','Freeman','Webb','Tucker',
    'Guzman','Burns','Crawford','Olson','Simpson','Porter','Hunter','Gordon','Mendez','Silva',
    'Shaw','Snyder','Mason','Dixon','Munoz','Rose','Spencer','Pierce','Floyd'
  ];

  var EMAIL_DOMAINS = [
    'gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com',
    'protonmail.com','aol.com','mail.com','example.com','live.com'
  ];

  var STREET_NAMES = [
    'Main','Oak','Maple','Cedar','Pine','Elm','Washington','Park','Lake','Hill',
    'River','Sunset','Sunrise','Spring','Forest','Valley','Mountain','Highland','Meadow',
    'Willow','Cherry','Birch','Walnut','Hickory','Poplar','Magnolia','Sycamore','Dogwood',
    'Lincoln','Jefferson','Madison','Monroe','Adams','Jackson','Franklin','Roosevelt','Kennedy',
    'First','Second','Third','Fourth','Fifth','North','South','East','West',
    'Church','Mill','College','Commerce','Market','Center','High','Court','Garden','Grove'
  ];

  var STREET_SUFFIXES = ['St','Ave','Blvd','Dr','Rd','Ln','Ct','Pl','Way','Cir','Ter','Trail'];

  var CITIES = [
    {city:'New York',state:'NY',zip:'10001'},{city:'Los Angeles',state:'CA',zip:'90001'},
    {city:'Chicago',state:'IL',zip:'60601'},{city:'Houston',state:'TX',zip:'77001'},
    {city:'Phoenix',state:'AZ',zip:'85001'},{city:'Philadelphia',state:'PA',zip:'19101'},
    {city:'San Antonio',state:'TX',zip:'78201'},{city:'San Diego',state:'CA',zip:'92101'},
    {city:'Dallas',state:'TX',zip:'75201'},{city:'San Jose',state:'CA',zip:'95101'},
    {city:'Austin',state:'TX',zip:'73301'},{city:'Jacksonville',state:'FL',zip:'32099'},
    {city:'San Francisco',state:'CA',zip:'94102'},{city:'Seattle',state:'WA',zip:'98101'},
    {city:'Denver',state:'CO',zip:'80201'},{city:'Nashville',state:'TN',zip:'37201'},
    {city:'Washington',state:'DC',zip:'20001'},{city:'Las Vegas',state:'NV',zip:'89101'},
    {city:'Portland',state:'OR',zip:'97201'},{city:'Baltimore',state:'MD',zip:'21201'},
    {city:'Atlanta',state:'GA',zip:'30301'},{city:'Minneapolis',state:'MN',zip:'55401'},
    {city:'Tampa',state:'FL',zip:'33601'},{city:'Miami',state:'FL',zip:'33101'},
    {city:'Raleigh',state:'NC',zip:'27601'},{city:'Charlotte',state:'NC',zip:'28201'},
    {city:'Cleveland',state:'OH',zip:'44101'},{city:'Pittsburgh',state:'PA',zip:'15201'},
    {city:'St. Louis',state:'MO',zip:'63101'},{city:'Kansas City',state:'MO',zip:'64101'}
  ];

  var PRODUCT_CATEGORIES = [
    {name:'Electronics',subcategories:['Smartphones','Laptops','Headphones','Cameras','TVs','Speakers','Wearables'],priceRange:[29.99,2499.99]},
    {name:'Clothing',subcategories:["Men's","Women's",'Kids','Shoes','Accessories','Activewear'],priceRange:[9.99,299.99]},
    {name:'Home & Garden',subcategories:['Furniture','Kitchen','Bedding','Decor','Outdoor','Lighting'],priceRange:[14.99,1999.99]},
    {name:'Books',subcategories:['Fiction','Non-Fiction','Science','History','Technology','Self-Help'],priceRange:[4.99,79.99]},
    {name:'Sports & Outdoors',subcategories:['Fitness','Camping','Cycling','Running','Swimming','Golf'],priceRange:[9.99,799.99]},
    {name:'Health & Beauty',subcategories:['Skincare','Haircare','Vitamins','Makeup','Fragrances'],priceRange:[4.99,199.99]},
    {name:'Toys & Games',subcategories:['Board Games','Action Figures','Educational','Video Games','Puzzles'],priceRange:[7.99,249.99]},
    {name:'Food & Grocery',subcategories:['Snacks','Beverages','Organic','Baking','Condiments'],priceRange:[1.99,89.99]},
    {name:'Automotive',subcategories:['Car Care','Parts','Accessories','Tools','Electronics'],priceRange:[9.99,899.99]},
    {name:'Office Products',subcategories:['Stationery','Printers','Supplies','Furniture','Paper'],priceRange:[4.99,1499.99]}
  ];

  var PRODUCT_ADJECTIVES = [
    'Premium','Professional','Ultra','Advanced','Smart','Wireless','Portable','Compact',
    'Heavy-Duty','Lightweight','Ergonomic','High-Performance','Eco-Friendly','Durable',
    'Versatile','Innovative','Classic','Modern','Deluxe','Elite','Superior','Pro','Max'
  ];

  var PRODUCT_NOUNS = {
    'Electronics':['Headphones','Speaker','Keyboard','Mouse','Monitor','Webcam','Charger','USB Hub','Power Bank','Smart Watch','Earbuds','Microphone'],
    'Clothing':['T-Shirt','Jeans','Jacket','Hoodie','Sneakers','Boots','Dress','Shorts','Hat','Gloves','Scarf','Belt'],
    'Home & Garden':['Coffee Maker','Blender','Toaster','Air Fryer','Vacuum Cleaner','Lamp','Throw Pillow','Area Rug','Picture Frame','Candle'],
    'Books':['Novel','Handbook','Guide','Encyclopedia','Workbook','Journal','Planner','Recipe Book'],
    'Sports & Outdoors':['Yoga Mat','Resistance Bands','Dumbbell Set','Jump Rope','Water Bottle','Hiking Boots','Camping Tent','Bike Helmet'],
    'Health & Beauty':['Face Wash','Moisturizer','Shampoo','Conditioner','Sunscreen SPF 50','Lip Balm','Hand Cream','Body Lotion'],
    'Toys & Games':['Building Blocks','Board Game','Puzzle','Action Figure','Remote Control Car','Science Kit','Art Set'],
    'Food & Grocery':['Coffee Beans','Green Tea','Protein Powder','Granola Bars','Olive Oil','Hot Sauce','Honey','Nut Butter'],
    'Automotive':['Car Mount','Dash Cam','Jump Starter','Tire Inflator','Car Vacuum','Seat Covers','Floor Mats'],
    'Office Products':['Desk Organizer','Sticky Notes','Ballpoint Pens','Stapler','Whiteboard','File Folders','Binder']
  };

  var USES = ['everyday use','professional work','outdoor adventures','home improvement','fitness enthusiasts','travel','students','gaming','cooking','office work'];
  var FEATURES = ['premium materials','ergonomic design','easy setup','long battery life','water resistance','fast charging','noise cancellation','Bluetooth connectivity','durable construction','energy efficiency'];

  var ORDER_STATUSES = [{value:'pending',weight:10},{value:'processing',weight:15},{value:'shipped',weight:20},{value:'delivered',weight:40},{value:'cancelled',weight:10},{value:'refunded',weight:5}];
  var PAYMENT_METHODS = [{value:'credit_card',weight:45},{value:'debit_card',weight:25},{value:'paypal',weight:15},{value:'apple_pay',weight:8},{value:'google_pay',weight:5},{value:'bank_transfer',weight:2}];
  var USER_STATUSES = [{value:'active',weight:70},{value:'inactive',weight:20},{value:'suspended',weight:5},{value:'pending',weight:5}];
  var USER_ROLES = [{value:'user',weight:80},{value:'admin',weight:5},{value:'moderator',weight:10},{value:'premium',weight:5}];

  // ── Generators ────────────────────────────────────────────────────────────

  var NOW = Date.now();
  var FIVE_YEARS_AGO = NOW - 5 * 365.25 * 24 * 60 * 60 * 1000;
  var THREE_YEARS_AGO = NOW - 3 * 365.25 * 24 * 60 * 60 * 1000;
  var TWO_YEARS_AGO = NOW - 2 * 365.25 * 24 * 60 * 60 * 1000;

  function generateUser(index, rng) {
    var firstName = rng.pick(FIRST_NAMES);
    var lastName = rng.pick(LAST_NAMES);
    var domain = rng.pick(EMAIL_DOMAINS);
    var suffix = index > 1 && rng.bool(0.3) ? String(index) : '';
    var email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + suffix + '@' + domain;
    var loc = rng.pick(CITIES);
    var street = rng.streetNumber() + ' ' + rng.pick(STREET_NAMES) + ' ' + rng.pick(STREET_SUFFIXES);
    var createdAt = rng.date(FIVE_YEARS_AGO, NOW);
    var updatedAt = rng.date(createdAt, NOW);
    return {
      id: index, uuid: rng.uuid(), firstName: firstName, lastName: lastName,
      email: email, phone: rng.phone(),
      address: { street: street, city: loc.city, state: loc.state, zip: rng.zip(loc.zip), country: 'US' },
      status: rng.weightedPick(USER_STATUSES), role: rng.weightedPick(USER_ROLES),
      age: rng.int(18, 80), createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString()
    };
  }

  function generateProduct(index, rng) {
    var cat = rng.pick(PRODUCT_CATEGORIES);
    var sub = rng.pick(cat.subcategories);
    var adj = rng.pick(PRODUCT_ADJECTIVES);
    var nouns = PRODUCT_NOUNS[cat.name] || ['Item','Product','Device'];
    var noun = rng.pick(nouns);
    var price = rng.decimal(cat.priceRange[0], cat.priceRange[1], 2);
    var createdAt = rng.date(THREE_YEARS_AGO, NOW);
    var updatedAt = rng.date(createdAt, NOW);
    var qty = rng.bool(0.85) ? rng.int(1, 500) : 0;
    var use = rng.pick(USES);
    var f1 = rng.pick(FEATURES), f2 = rng.pick(FEATURES);
    while (f2 === f1) f2 = rng.pick(FEATURES);
    var desc = adj + ' ' + noun + ' designed for ' + use + '. Features ' + f1 + ' and ' + f2 + '.';
    var tagPool = [adj.toLowerCase(), cat.name.toLowerCase(), sub.toLowerCase(), 'new', 'featured'];
    return {
      id: index, uuid: rng.uuid(), name: adj + ' ' + noun, description: desc,
      price: price, category: cat.name, subcategory: sub,
      sku: 'SKU-' + String(index).padStart(6, '0'),
      inStock: qty > 0, quantity: qty,
      rating: rng.decimal(1, 5, 1), reviewCount: rng.int(0, 5000),
      tags: rng.sample(tagPool, rng.int(1, Math.min(3, tagPool.length))),
      createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString()
    };
  }

  function generateOrder(index, rng, maxUserId) {
    maxUserId = maxUserId || 1000;
    var status = rng.weightedPick(ORDER_STATUSES);
    var orderedAt = rng.date(TWO_YEARS_AGO, NOW);
    var shippedAt = null, deliveredAt = null;
    if (status === 'shipped' || status === 'delivered') shippedAt = rng.date(orderedAt, NOW).toISOString();
    if (status === 'delivered' && shippedAt) deliveredAt = rng.date(new Date(shippedAt), NOW).toISOString();
    var items = [];
    var itemCount = rng.int(1, 5);
    for (var i = 0; i < itemCount; i++) {
      var cat = rng.pick(PRODUCT_CATEGORIES);
      var up = rng.decimal(cat.priceRange[0], cat.priceRange[1], 2);
      var q = rng.int(1, 4);
      items.push({ productId: rng.int(1, 10000), name: 'Product ' + rng.int(1000, 9999), category: cat.name, unitPrice: up, quantity: q, subtotal: parseFloat((up * q).toFixed(2)) });
    }
    var subtotal = parseFloat(items.reduce(function (s, it) { return s + it.subtotal; }, 0).toFixed(2));
    var shipping = rng.decimal(0, 19.99, 2);
    var tax = parseFloat((subtotal * rng.decimal(0.05, 0.12, 4)).toFixed(2));
    var discount = rng.bool(0.2) ? rng.decimal(1, Math.min(subtotal * 0.3, 50), 2) : 0;
    var total = parseFloat((subtotal + shipping + tax - discount).toFixed(2));
    return {
      id: index, uuid: rng.uuid(), orderNumber: 'ORD-' + String(index).padStart(8, '0'),
      userId: rng.int(1, maxUserId), status: status, items: items,
      itemCount: items.reduce(function (s, it) { return s + it.quantity; }, 0),
      subtotal: subtotal, shippingCost: shipping, tax: tax, discount: discount, total: total,
      paymentMethod: rng.weightedPick(PAYMENT_METHODS), currency: 'USD',
      shippingAddress: { street: rng.int(1,9999) + ' Shipping Lane', city: 'Springfield', state: 'IL', zip: '62701', country: 'US' },
      orderedAt: orderedAt.toISOString(), shippedAt: shippedAt, deliveredAt: deliveredAt
    };
  }

  // ── Validation ────────────────────────────────────────────────────────────

  var SUPPORTED_TYPES = ['users', 'products', 'orders'];
  var customGenerators = {};

  function validateOptions(opts, type) {
    opts = opts || {};
    if (opts.count === undefined) opts.count = 10;
    if (!Number.isInteger(opts.count) || opts.count < 0) throw new RangeError('count must be a non-negative integer');
    if (opts.count > 100000) throw new RangeError('count max is 100,000 in the playground');
    if (opts.seed !== undefined) {
      if (!isFinite(opts.seed) || opts.seed < 0) throw new RangeError('seed must be a non-negative number');
      opts.seed = Math.floor(opts.seed);
    }
    opts.fields = opts.fields || {};
    return opts;
  }

  // ── Core generate() ───────────────────────────────────────────────────────

  function generate(typeOrMap, options) {
    var isSingle = typeof typeOrMap === 'string';
    var typeMap = {};

    if (isSingle) {
      typeMap[typeOrMap] = Object.assign({}, options || {});
    } else if (typeOrMap && typeof typeOrMap === 'object') {
      typeMap = typeOrMap;
    } else {
      throw new TypeError('generate(): first argument must be a type string or object');
    }

    // resolve seed
    var seed;
    Object.values(typeMap).forEach(function (o) { if (o && o.seed !== undefined && seed === undefined) seed = o.seed; });
    seedManager.init(seed);

    // validate all options
    var normMap = {};
    Object.keys(typeMap).forEach(function (t) { normMap[t] = validateOptions(Object.assign({}, typeMap[t]), t); });

    // cross-entity context
    var context = {};
    if (normMap.users) context.userCount = normMap.users.count;
    if (normMap.products) context.productCount = normMap.products.count;

    // run generators
    var results = {};
    Object.keys(normMap).forEach(function (type) {
      var opts = normMap[type];
      var rng = seedManager.createNamed(type);
      var fields = opts.fields || {};
      var records = [];

      var genFn = customGenerators[type.toLowerCase()];
      if (!genFn) {
        var t = type.toLowerCase();
        if (t === 'users') genFn = function (i, r) { return generateUser(i, r); };
        else if (t === 'products') genFn = function (i, r) { return generateProduct(i, r); };
        else if (t === 'orders') genFn = function (i, r) { return generateOrder(i, r, context.userCount); };
        else throw new RangeError('Unknown type: "' + type + '". Supported: ' + SUPPORTED_TYPES.join(', '));
      }

      for (var i = 1; i <= opts.count; i++) {
        var rec = genFn(i, rng);
        Object.keys(fields).forEach(function (key) {
          try { rec[key] = fields[key](rec); } catch (_) { rec[key] = null; }
        });
        records.push(rec);
      }
      results[type] = records;
    });

    return isSingle ? results[typeOrMap] : results;
  }

  function registerGenerator(type, fn) {
    if (typeof type !== 'string' || !type.trim()) throw new TypeError('type must be a non-empty string');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    customGenerators[type.toLowerCase()] = fn;
  }

  function listGenerators() {
    return SUPPORTED_TYPES.concat(Object.keys(customGenerators));
  }

  // ── Expose ────────────────────────────────────────────────────────────────

  global.MockDataGenerator = {
    generate: generate,
    registerGenerator: registerGenerator,
    listGenerators: listGenerators,
    Random: Random,
    seedManager: seedManager,
    SUPPORTED_TYPES: SUPPORTED_TYPES
  };

}(window));
