const { db } = require('./database');

function seed() {
    // Check if already seeded
    const existing = db.prepare('SELECT COUNT(*) as count FROM trips').get();
    if (existing.count > 0) return;

    console.log('🌱 Seeding database with trip data...');

    // Create the trip
    const tripStmt = db.prepare('INSERT INTO trips (name, start_date, end_date) VALUES (?, ?, ?)');
    const tripResult = tripStmt.run('Summer Family Trip 2026', '2026-05-06', '2026-06-21');
    const tripId = tripResult.lastInsertRowid;

    const dayStmt = db.prepare('INSERT INTO trip_days (trip_id, date, title, notes) VALUES (?, ?, ?, ?)');
    const flightStmt = db.prepare('INSERT INTO flights (trip_day_id, airline, flight_number, departure_city, arrival_city, departure_time, arrival_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const placeStmt = db.prepare('INSERT INTO places (trip_day_id, name, location, duration, map_embed_url, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const checkStmt = db.prepare('INSERT INTO checklist_items (trip_day_id, text, is_done, sort_order) VALUES (?, ?, ?, ?)');
    const expenseStmt = db.prepare('INSERT INTO expenses (trip_id, trip_day_id, category, description, amount) VALUES (?, ?, ?, ?, ?)');

    // ========================================================
    // WEEK 1: NEW YORK CITY (May 6 – May 10)
    // ========================================================

    // --- May 6 (Wed): Kunal & Murali fly to JFK ---
    const ny0 = dayStmt.run(tripId, '2026-05-06', 'Fly to New York (Kunal & Murali)', 'Kunal and Murali fly to JFK ahead of parents arriving.').lastInsertRowid;
    flightStmt.run(ny0, 'Airline TBD', '', 'Lansing / DTW', 'New York (JFK)', '', '', 'Kunal & Murali flying to JFK');
    checkStmt.run(ny0, 'Pack bags and essentials', 0, 0);
    checkStmt.run(ny0, 'Confirm flight booking', 0, 1);
    checkStmt.run(ny0, 'Arrange ride to airport', 0, 2);

    // --- May 7 (Thu): Parents arrive, NYC Day 1 ---
    const ny1 = dayStmt.run(tripId, '2026-05-07', 'Parents Arrive – NYC Day 1', 'Parents arrive at JFK. Meet up and start exploring New York City.').lastInsertRowid;
    flightStmt.run(ny1, 'Airline TBD', '', 'India', 'New York (JFK)', '', '', 'Parents arriving at JFK');
    placeStmt.run(ny1, 'Times Square', 'Manhattan, New York, NY', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.9857!3d40.758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890', 'Welcome to NYC!', 1);
    placeStmt.run(ny1, 'Hotel Check-in', 'Manhattan, New York, NY', '1 hour', '', 'Check-in and freshen up after travel', 0);
    checkStmt.run(ny1, 'Confirm hotel reservation', 0, 0);
    checkStmt.run(ny1, 'Pick up parents from JFK', 0, 1);
    checkStmt.run(ny1, 'Get grocery essentials', 0, 2);

    // --- May 8 (Fri): NYC Day 2 ---
    const ny2 = dayStmt.run(tripId, '2026-05-08', 'Exploring Manhattan', 'Full day exploring iconic Manhattan landmarks.').lastInsertRowid;
    placeStmt.run(ny2, 'Statue of Liberty', 'Liberty Island, New York, NY', '3 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2!2d-74.0445!3d40.6892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25090129c363d%3A0x40c6a5770d25022b!2sStatue%20of%20Liberty!5e0!3m2!1sen!2sus!4v1234567890', 'Book ferry tickets in advance', 1);
    placeStmt.run(ny2, 'Central Park', 'Manhattan, New York, NY', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.5!2d-73.9654!3d40.7829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2589a018531e3%3A0xb9df1f7387a94119!2sCentral%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'Beautiful walk through the park', 2);
    placeStmt.run(ny2, 'Empire State Building', '350 5th Ave, New York, NY', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.4!2d-73.9857!3d40.7484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890', 'Evening observation deck visit', 3);
    checkStmt.run(ny2, 'Book Statue of Liberty ferry tickets', 0, 0);
    checkStmt.run(ny2, 'Pack sunscreen and water', 0, 1);

    // --- May 9 (Sat): NYC Day 3 ---
    const ny3 = dayStmt.run(tripId, '2026-05-09', 'Brooklyn & Museums', 'Exploring Brooklyn Bridge, DUMBO, and museums.').lastInsertRowid;
    placeStmt.run(ny3, 'Brooklyn Bridge', 'Brooklyn Bridge, New York, NY', '1.5 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.0!2d-73.9969!3d40.7061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a2343ce7b2b%3A0x2526ddba7abd465c!2sBrooklyn%20Bridge!5e0!3m2!1sen!2sus!4v1234567890', 'Walk across the iconic bridge', 1);
    placeStmt.run(ny3, 'DUMBO', 'DUMBO, Brooklyn, NY', '2 hours', '', 'Great for photos with Manhattan skyline', 2);
    placeStmt.run(ny3, 'One World Observatory', '285 Fulton St, New York, NY', '2 hours', '', 'Amazing views from the top', 3);
    checkStmt.run(ny3, 'Wear comfortable walking shoes', 0, 0);
    checkStmt.run(ny3, 'Charge camera and phone', 0, 1);

    // --- May 10 (Sun): Return to DTW & Drive to Lansing ---
    const ny4 = dayStmt.run(tripId, '2026-05-10', 'Return to Michigan', 'Flying from JFK back to DTW, then driving to Lansing.').lastInsertRowid;
    flightStmt.run(ny4, 'Airline TBD', '', 'New York (JFK)', 'Detroit (DTW)', '', '', 'Return flight to Detroit');
    placeStmt.run(ny4, 'Drive DTW to Lansing', 'I-96 W, Michigan', '1.5 hours', '', 'Drive from Detroit Metro Airport to Lansing', 1);
    checkStmt.run(ny4, 'Check out of NYC hotel', 0, 0);
    checkStmt.run(ny4, 'Pack all bags', 0, 1);
    checkStmt.run(ny4, 'Confirm return flight', 0, 2);

    // ---- Lansing rest days (May 11-14) ----
    dayStmt.run(tripId, '2026-05-11', 'Rest Day in Lansing', 'Recovering from the NYC trip. Relaxing at home.');
    dayStmt.run(tripId, '2026-05-12', 'Lansing – Settling In', 'Running errands, groceries, and home time with parents.');
    dayStmt.run(tripId, '2026-05-13', 'Lansing – Local Exploration', 'Visit local spots around Lansing with parents.');
    dayStmt.run(tripId, '2026-05-14', 'Lansing – Free Day', 'Free day at home. Preparing for Cleveland trip.');

    // ========================================================
    // WEEK 2: CLEVELAND & NIAGARA FALLS (May 15 – May 18)
    // ========================================================

    // --- May 15 (Fri): Drive to Cleveland ---
    const cl1 = dayStmt.run(tripId, '2026-05-15', 'Drive to Cleveland', 'Friday night drive to Cleveland to visit Harsha.').lastInsertRowid;
    placeStmt.run(cl1, 'Drive Lansing to Cleveland', 'I-69 S & I-80 E, Ohio', '4 hours', '', 'Drive to Harsha\'s home in Cleveland', 1);
    placeStmt.run(cl1, 'Harsha\'s Home', 'Cleveland, OH', 'Overnight', '', 'Stay at Harsha\'s place for the night', 2);
    checkStmt.run(cl1, 'Pack overnight bags', 0, 0);
    checkStmt.run(cl1, 'Check car fuel and tires', 0, 1);
    checkStmt.run(cl1, 'Confirm plans with Harsha', 0, 2);

    // --- May 16 (Sat): Temple & Drive to Niagara Falls ---
    const cl2 = dayStmt.run(tripId, '2026-05-16', 'Temple Visit & Niagara Falls', 'Morning temple visit near Cleveland, then evening drive to Niagara Falls.').lastInsertRowid;
    placeStmt.run(cl2, 'Hindu Temple', 'Cleveland, OH area', '2 hours', '', 'Morning temple visit', 1);
    placeStmt.run(cl2, 'Drive to Niagara Falls', 'I-90 E, New York', '3.5 hours', '', 'Evening drive from Cleveland to Niagara Falls', 2);
    placeStmt.run(cl2, 'Niagara Falls State Park', 'Niagara Falls, NY 14303', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2901.0!2d-79.0742!3d43.0799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d34307a70b15ed%3A0x6e1bdd4ee4b01722!2sNiagara%20Falls%20State%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'Evening arrival at Niagara Falls', 3);
    checkStmt.run(cl2, 'Book Niagara Falls hotel', 0, 0);
    checkStmt.run(cl2, 'Pack rain ponchos for the falls', 0, 1);
    checkStmt.run(cl2, 'Pack warm jackets', 0, 2);

    // --- May 17 (Sun): Return from Niagara via Cleveland ---
    const cl3 = dayStmt.run(tripId, '2026-05-17', 'Niagara Falls Morning & Return', 'Morning at Niagara Falls, then drive back. Stop at Harsha\'s home for 2 hrs rest, then drive to Lansing.').lastInsertRowid;
    placeStmt.run(cl3, 'Niagara Falls – Morning Views', 'Niagara Falls, NY', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2901.0!2d-79.0742!3d43.0799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d34307a70b15ed%3A0x6e1bdd4ee4b01722!2sNiagara%20Falls%20State%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'Enjoy the morning views and mist', 1);
    placeStmt.run(cl3, 'Maid of the Mist', 'Niagara Falls, NY', '1 hour', '', 'Iconic boat tour', 2);
    placeStmt.run(cl3, 'Drive to Harsha\'s Home', 'I-90 W, Ohio', '3.5 hours', '', 'Drive back to Cleveland, stop at Harsha\'s for 2 hrs rest', 3);
    placeStmt.run(cl3, 'Drive Cleveland to Lansing', 'I-80 W & I-69 N, Michigan', '4 hours', '', 'Final drive home to Lansing', 4);
    checkStmt.run(cl3, 'Check out of Niagara hotel', 0, 0);
    checkStmt.run(cl3, 'Pack snacks for the drive', 0, 1);

    // --- May 18-21: Rest days in Lansing ---
    dayStmt.run(tripId, '2026-05-18', 'Rest Day in Lansing', 'Recovering from Niagara road trip.');
    dayStmt.run(tripId, '2026-05-19', 'Lansing – Free Day', 'Relaxing at home with family.');
    dayStmt.run(tripId, '2026-05-20', 'Lansing – Free Day', 'Quality time with parents at home.');
    dayStmt.run(tripId, '2026-05-21', 'Lansing – Preparing for California', 'Packing and preparing for the California trip.');

    // ========================================================
    // WEEK 3: CALIFORNIA – SAN FRANCISCO (May 22 – May 26)
    // ========================================================

    // --- May 22 (Fri): Fly to SFO, Visit Golden Gate ---
    const ca1 = dayStmt.run(tripId, '2026-05-22', 'Fly to San Francisco', 'Morning flight to SFO. Visit Golden Gate Bridge, then head to Lavanya Aunty\'s home by 6 PM.').lastInsertRowid;
    flightStmt.run(ca1, 'Airline TBD', '', 'Lansing / DTW', 'San Francisco (SFO)', '', '', 'Morning flight to San Francisco');
    placeStmt.run(ca1, 'Golden Gate Bridge', 'Golden Gate Bridge, San Francisco, CA', '3 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0!2d-122.4783!3d37.8199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808586deffffffc3%3A0xcded139783705509!2sGolden%20Gate%20Bridge!5e0!3m2!1sen!2sus!4v1234567890', 'Exploring the iconic Golden Gate Bridge till evening', 1);
    placeStmt.run(ca1, 'Fisherman\'s Wharf', 'Fisherman\'s Wharf, San Francisco, CA', '2 hours', '', 'Seafood and sea lions along the waterfront', 2);
    placeStmt.run(ca1, 'Lavanya Aunty\'s Home', 'San Francisco Bay Area, CA', 'Evening', '', 'Arrive by 6 PM, dinner and stay', 3);
    checkStmt.run(ca1, 'Confirm flight tickets', 0, 0);
    checkStmt.run(ca1, 'Pack warm jacket for SF fog', 0, 1);
    checkStmt.run(ca1, 'Confirm with Lavanya Aunty', 0, 2);

    // --- May 23 (Sat): Explore SF ---
    const ca2 = dayStmt.run(tripId, '2026-05-23', 'San Francisco Sightseeing', 'Full day exploring San Francisco.').lastInsertRowid;
    placeStmt.run(ca2, 'Alcatraz Island', 'San Francisco Bay, CA', '3 hours', '', 'Book the ferry in advance', 1);
    placeStmt.run(ca2, 'Chinatown', 'Chinatown, San Francisco, CA', '1.5 hours', '', 'Oldest Chinatown in North America', 2);
    placeStmt.run(ca2, 'Lombard Street', 'Lombard St, San Francisco, CA', '30 min', '', 'The crookedest street in the world', 3);
    placeStmt.run(ca2, 'Twin Peaks', 'Twin Peaks, San Francisco, CA', '1 hour', '', 'Panoramic views of the city', 4);
    checkStmt.run(ca2, 'Book Alcatraz ferry tickets', 0, 0);
    checkStmt.run(ca2, 'Charge camera', 0, 1);

    // --- May 24 (Sun): More SF / Bay Area ---
    const ca3 = dayStmt.run(tripId, '2026-05-24', 'Bay Area Exploration', 'Exploring more of the Bay Area with family.').lastInsertRowid;
    placeStmt.run(ca3, 'Stanford University', 'Stanford, CA', '2 hours', '', 'Campus tour', 1);
    placeStmt.run(ca3, 'Silicon Valley Tour', 'Mountain View / Cupertino, CA', '2 hours', '', 'Visit Apple Park and Google campus', 2);
    placeStmt.run(ca3, 'Sausalito', 'Sausalito, CA', '2 hours', '', 'Charming waterfront town across the bay', 3);
    checkStmt.run(ca3, 'Plan sightseeing route', 0, 0);

    // --- May 25 (Sun night): Return flight ---
    const ca4 = dayStmt.run(tripId, '2026-05-25', 'Return from California', 'Depart SFO at 9:35 PM. Arrive Lansing Monday morning at 7 AM.').lastInsertRowid;
    flightStmt.run(ca4, 'Airline TBD', '', 'San Francisco (SFO)', 'Lansing / DTW', '09:35 PM', '07:00 AM (+1)', 'Red-eye flight, arrive Monday morning');
    checkStmt.run(ca4, 'Pack all luggage', 0, 0);
    checkStmt.run(ca4, 'Thank Lavanya Aunty', 0, 1);
    checkStmt.run(ca4, 'Head to SFO airport by 7 PM', 0, 2);

    // --- May 26 (Mon): Arrival back in Lansing ---
    const ca5 = dayStmt.run(tripId, '2026-05-26', 'Arrive in Lansing', 'Landing at 7 AM. Rest day after red-eye flight.').lastInsertRowid;
    checkStmt.run(ca5, 'Pick up luggage and drive home', 0, 0);
    checkStmt.run(ca5, 'Rest and recover from travel', 0, 1);

    // --- May 27 (Tue): Rest/Prep ---
    dayStmt.run(tripId, '2026-05-27', 'Rest & Birthday Prep', 'Resting and preparing for Mom\'s birthday celebration.');

    // ========================================================
    // WEEK 4: LANSING – MOM'S BIRTHDAY & BABY SHOWER (May 28 – Jun 1)
    // ========================================================

    // --- May 28 (Thu): Mom's Birthday ---
    const bday = dayStmt.run(tripId, '2026-05-28', "Mom's Birthday Celebration 🎂", "Celebrating Mom's birthday! Inviting all of Mom's friends for a party.").lastInsertRowid;
    placeStmt.run(bday, 'Birthday Party at Home', 'Lansing, MI', 'Full Day', '', 'Hosting birthday celebration with Mom\'s friends', 1);
    checkStmt.run(bday, 'Order birthday cake', 0, 0);
    checkStmt.run(bday, 'Buy decorations and balloons', 0, 1);
    checkStmt.run(bday, 'Prepare food / order catering', 0, 2);
    checkStmt.run(bday, 'Send invitations to Mom\'s friends', 0, 3);
    checkStmt.run(bday, 'Buy birthday gift', 0, 4);

    // --- May 29 (Fri): Swetakka's Baby Shower ---
    const shower = dayStmt.run(tripId, '2026-05-29', "Swetakka's Baby Shower 🍼", "Attending Swetakka's baby shower celebration.").lastInsertRowid;
    placeStmt.run(shower, 'Baby Shower Venue', 'Lansing, MI area', 'Full Day', '', 'Swetakka\'s baby shower celebration', 1);
    checkStmt.run(shower, 'Buy baby shower gift', 0, 0);
    checkStmt.run(shower, 'Confirm venue and timing', 0, 1);
    checkStmt.run(shower, 'Help with decorations', 0, 2);

    // --- May 30 (Sat) - Jun 1 (Mon): Lansing weekend ---
    const lan1 = dayStmt.run(tripId, '2026-05-30', 'Lansing Weekend', 'Staying in Lansing. Visit local places if time permits.').lastInsertRowid;
    placeStmt.run(lan1, 'Michigan State Capitol', 'Lansing, MI', '1.5 hours', '', 'Show parents the historic capitol building', 1);
    placeStmt.run(lan1, 'Potter Park Zoo', 'Lansing, MI', '2 hours', '', 'Fun outing with family', 2);
    checkStmt.run(lan1, 'Check local events', 0, 0);

    dayStmt.run(tripId, '2026-05-31', 'Lansing – Local Sightseeing', 'Exploring local places in Lansing area with family.');
    dayStmt.run(tripId, '2026-06-01', 'Lansing – Relaxation', 'Quiet day at home, quality family time.');

    // --- Jun 2-4: Weekdays in Lansing ---
    dayStmt.run(tripId, '2026-06-02', 'Lansing – Free Day', 'Free day in Lansing.');
    dayStmt.run(tripId, '2026-06-03', 'Lansing – Free Day', 'Spending time with family.');
    dayStmt.run(tripId, '2026-06-04', 'Lansing – Preparing for Chicago', 'Packing for the Chicago weekend trip.');

    // ========================================================
    // WEEK 5: CHICAGO (Jun 5 – Jun 7)
    // ========================================================

    // --- Jun 5 (Fri): Drive to Chicago ---
    const chi1 = dayStmt.run(tripId, '2026-06-05', 'Drive to Chicago', 'Friday night drive from Lansing to Chicago.').lastInsertRowid;
    placeStmt.run(chi1, 'Drive Lansing to Chicago', 'I-94 W & I-94 S, Illinois', '3.5 hours', '', 'Evening drive to Chicago', 1);
    checkStmt.run(chi1, 'Book Chicago hotel', 0, 0);
    checkStmt.run(chi1, 'Pack overnight bags', 0, 1);
    checkStmt.run(chi1, 'Plan Chicago itinerary', 0, 2);

    // --- Jun 6 (Sat): Chicago sightseeing ---
    const chi2 = dayStmt.run(tripId, '2026-06-06', 'Exploring Chicago', 'Full day exploring the Windy City!').lastInsertRowid;
    placeStmt.run(chi2, 'Millennium Park & Cloud Gate', '201 E Randolph St, Chicago, IL', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.0!2d-87.6226!3d41.8826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2ca68d8e18b9%3A0xfe2798f4f9830e16!2sMillennium%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'The Bean / Cloud Gate photo spot', 1);
    placeStmt.run(chi2, 'Art Institute of Chicago', '111 S Michigan Ave, Chicago, IL', '2.5 hours', '', 'One of the best art museums in the world', 2);
    placeStmt.run(chi2, 'Navy Pier', '600 E Grand Ave, Chicago, IL', '2 hours', '', 'Lakefront views and entertainment', 3);
    placeStmt.run(chi2, 'Deep Dish Pizza', 'Lou Malnati\'s / Giordano\'s, Chicago, IL', '1.5 hours', '', 'Must-try Chicago deep dish!', 4);
    placeStmt.run(chi2, 'Willis Tower Skydeck', '233 S Wacker Dr, Chicago, IL', '1.5 hours', '', 'Step out on The Ledge for amazing views', 5);
    checkStmt.run(chi2, 'Buy CTA day pass', 0, 0);
    checkStmt.run(chi2, 'Book Skydeck tickets online', 0, 1);

    // --- Jun 7 (Sun): Return to Lansing ---
    const chi3 = dayStmt.run(tripId, '2026-06-07', 'Return from Chicago', 'Sunday afternoon drive back to Lansing.').lastInsertRowid;
    placeStmt.run(chi3, 'Chicago Morning Walk', 'Lakefront Trail, Chicago, IL', '2 hours', '', 'Morning walk along Lake Michigan', 1);
    placeStmt.run(chi3, 'Drive Chicago to Lansing', 'I-94 E, Michigan', '3.5 hours', '', 'Afternoon drive back home', 2);
    checkStmt.run(chi3, 'Check out of hotel', 0, 0);
    checkStmt.run(chi3, 'Grab lunch before leaving', 0, 1);

    // --- Jun 8-11: Weekdays in Lansing ---
    dayStmt.run(tripId, '2026-06-08', 'Lansing – Rest Day', 'Recovering from Chicago trip.');
    dayStmt.run(tripId, '2026-06-09', 'Lansing – Free Day', 'Spending time with family.');
    dayStmt.run(tripId, '2026-06-10', 'Lansing – Free Day', 'Quality family time.');
    dayStmt.run(tripId, '2026-06-11', 'Lansing – Preparing for Mackinac', 'Packing and planning for Mackinac Island trip.');

    // ========================================================
    // WEEK 6: MACKINAC ISLAND & UPPER PENINSULA (Jun 12 – Jun 14)
    // ========================================================

    // --- Jun 12 (Fri): Drive to Mackinac Island ---
    const mac1 = dayStmt.run(tripId, '2026-06-12', 'Drive to Mackinac Island', 'Road trip to Mackinac Island in northern Michigan.').lastInsertRowid;
    placeStmt.run(mac1, 'Drive Lansing to Mackinaw City', 'I-75 N, Michigan', '3.5 hours', '', 'Drive north to Mackinaw City', 1);
    placeStmt.run(mac1, 'Ferry to Mackinac Island', 'Mackinaw City, MI', '30 min', '', 'Take the ferry to the island (no cars allowed!)', 2);
    placeStmt.run(mac1, 'Mackinac Island', 'Mackinac Island, MI', '4 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2850.0!2d-84.6189!3d45.8492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4d354f94d03d7e2d%3A0x2c0e600e21a1c66c!2sMackinac%20Island!5e0!3m2!1sen!2sus!4v1234567890', 'Explore the car-free island, try famous fudge!', 3);
    checkStmt.run(mac1, 'Book ferry tickets', 0, 0);
    checkStmt.run(mac1, 'Book hotel in Mackinaw City area', 0, 1);
    checkStmt.run(mac1, 'Pack comfortable walking shoes', 0, 2);

    // --- Jun 13 (Sat): Upper Peninsula ---
    const mac2 = dayStmt.run(tripId, '2026-06-13', 'Upper Peninsula Exploration', 'Exploring Upper Peninsula attractions near Mackinac.').lastInsertRowid;
    placeStmt.run(mac2, 'Mackinac Bridge', 'Mackinac Bridge, MI', '30 min', '', 'Drive across the iconic 5-mile bridge to the UP', 1);
    placeStmt.run(mac2, 'Tahquamenon Falls', 'Paradise, MI 49768', '3 hours', '', 'Beautiful Upper Peninsula waterfall', 2);
    placeStmt.run(mac2, 'Pictured Rocks (if time)', 'Munising, MI', '3 hours', '', 'Stunning lakeside cliffs — visit if time permits', 3);
    checkStmt.run(mac2, 'Pack snacks and water for the day', 0, 0);
    checkStmt.run(mac2, 'Fill up gas before UP drive', 0, 1);
    checkStmt.run(mac2, 'Check weather forecast', 0, 2);

    // --- Jun 14 (Sun): Return to Lansing ---
    const mac3 = dayStmt.run(tripId, '2026-06-14', 'Return from Mackinac', 'Driving back to Lansing from Upper Peninsula.').lastInsertRowid;
    placeStmt.run(mac3, 'Drive Back to Lansing', 'I-75 S, Michigan', '4 hours', '', 'Scenic drive south through Michigan', 1);
    checkStmt.run(mac3, 'Check out of hotel', 0, 0);
    checkStmt.run(mac3, 'Pack all luggage', 0, 1);

    // --- Jun 15-18: Weekdays in Lansing ---
    dayStmt.run(tripId, '2026-06-15', 'Lansing – Rest Day', 'Recovering from Mackinac trip.');
    dayStmt.run(tripId, '2026-06-16', 'Lansing – Free Day', 'Family time at home.');
    dayStmt.run(tripId, '2026-06-17', 'Lansing – Free Day', 'Spending time with parents.');
    dayStmt.run(tripId, '2026-06-18', 'Lansing – Preparing for Temple Visit', 'Planning the temple visit route for the weekend.');

    // ========================================================
    // WEEK 7: MICHIGAN TEMPLES (Jun 19 – Jun 21)
    // ========================================================

    // --- Jun 19 (Fri): Temple visits ---
    const tmp1 = dayStmt.run(tripId, '2026-06-19', 'Michigan Temple Visit', 'Visiting nearby Hindu temples in Michigan.').lastInsertRowid;
    placeStmt.run(tmp1, 'Hindu Temple of Canton', '44955 Cherry Hill Rd, Canton, MI', '2 hours', '', 'Beautiful temple in the Canton/Ann Arbor area', 1);
    placeStmt.run(tmp1, 'Bharatiya Temple', '6850 Adams Rd, Troy, MI', '2 hours', '', 'Major Hindu temple in the Detroit metro area', 2);
    checkStmt.run(tmp1, 'Check temple visiting hours', 0, 0);
    checkStmt.run(tmp1, 'Pack traditional clothes', 0, 1);
    checkStmt.run(tmp1, 'Plan driving route', 0, 2);

    // --- Jun 20 (Sat): More temples ---
    const tmp2 = dayStmt.run(tripId, '2026-06-20', 'Farmington Hills & Novi Temples', 'Visiting temples in Farmington Hills and Novi area.').lastInsertRowid;
    placeStmt.run(tmp2, 'Sri Venkateswara Temple', 'Farmington Hills, MI', '2 hours', '', 'Renowned temple in Farmington Hills', 1);
    placeStmt.run(tmp2, 'ISKCON Temple', 'Novi, MI area', '2 hours', '', 'Hare Krishna temple visit', 2);
    placeStmt.run(tmp2, 'Ann Arbor Downtown', 'Ann Arbor, MI', '2 hours', '', 'If time permits, explore the charming downtown', 3);
    checkStmt.run(tmp2, 'Carry offerings for the temple', 0, 0);
    checkStmt.run(tmp2, 'Pack lunch / find Indian restaurants nearby', 0, 1);

    // --- Jun 21 (Sun): Last Day ---
    const tmp3 = dayStmt.run(tripId, '2026-06-21', 'Final Day – Return to Lansing', 'Last day of the summer trip. Returning to Lansing.').lastInsertRowid;
    placeStmt.run(tmp3, 'Leisurely Morning', 'Lansing, MI', '2 hours', '', 'Relaxed morning with family', 1);
    checkStmt.run(tmp3, 'Reflect on the amazing summer trip!', 0, 0);

    console.log('✅ Seed data inserted successfully!');
}

module.exports = { seed };
