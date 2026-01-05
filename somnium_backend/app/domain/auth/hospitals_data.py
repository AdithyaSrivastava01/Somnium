"""
USA Hospitals data - Major hospitals with ECMO capabilities.
This list includes leading academic medical centers and major hospitals across the USA.
Each hospital has allowed email domains for user registration validation.
"""

USA_HOSPITALS = [
    # California
    {
        "name": "Cedars-Sinai Medical Center",
        "city": "Los Angeles",
        "state": "CA",
        "email_domain": "cshs.org",
    },
    {
        "name": "UCLA Medical Center",
        "city": "Los Angeles",
        "state": "CA",
        "email_domain": "mednet.ucla.edu",
    },
    {
        "name": "Stanford Health Care",
        "city": "Stanford",
        "state": "CA",
        "email_domain": "stanfordhealthcare.org",
    },
    {
        "name": "UC San Diego Health",
        "city": "San Diego",
        "state": "CA",
        "email_domain": "health.ucsd.edu",
    },
    {
        "name": "UCSF Medical Center",
        "city": "San Francisco",
        "state": "CA",
        "email_domain": "ucsf.edu",
    },
    {
        "name": "Scripps Memorial Hospital La Jolla",
        "city": "La Jolla",
        "state": "CA",
        "email_domain": "scrippshealth.org",
    },
    # New York
    {
        "name": "NewYork-Presbyterian Hospital",
        "city": "New York",
        "state": "NY",
        "email_domain": "nyp.org",
    },
    {
        "name": "Mount Sinai Hospital",
        "city": "New York",
        "state": "NY",
        "email_domain": "mountsinai.org",
    },
    {
        "name": "NYU Langone Medical Center",
        "city": "New York",
        "state": "NY",
        "email_domain": "nyulangone.org",
    },
    {
        "name": "Memorial Sloan Kettering Cancer Center",
        "city": "New York",
        "state": "NY",
        "email_domain": "mskcc.org",
    },
    # Massachusetts
    {
        "name": "Massachusetts General Hospital",
        "city": "Boston",
        "state": "MA",
        "email_domain": "mgh.harvard.edu",
    },
    {
        "name": "Brigham and Women's Hospital",
        "city": "Boston",
        "state": "MA",
        "email_domain": "bwh.harvard.edu",
    },
    {
        "name": "Beth Israel Deaconess Medical Center",
        "city": "Boston",
        "state": "MA",
        "email_domain": "bidmc.harvard.edu",
    },
    # Pennsylvania
    {
        "name": "Hospital of the University of Pennsylvania",
        "city": "Philadelphia",
        "state": "PA",
        "email_domain": "pennmedicine.upenn.edu",
    },
    {
        "name": "UPMC Presbyterian",
        "city": "Pittsburgh",
        "state": "PA",
        "email_domain": "upmc.edu",
    },
    {
        "name": "Thomas Jefferson University Hospital",
        "city": "Philadelphia",
        "state": "PA",
        "email_domain": "jefferson.edu",
    },
    # Texas
    {
        "name": "Houston Methodist Hospital",
        "city": "Houston",
        "state": "TX",
        "email_domain": "houstonmethodist.org",
    },
    {
        "name": "MD Anderson Cancer Center",
        "city": "Houston",
        "state": "TX",
        "email_domain": "mdanderson.org",
    },
    {
        "name": "UT Southwestern Medical Center",
        "city": "Dallas",
        "state": "TX",
        "email_domain": "utsouthwestern.edu",
    },
    {
        "name": "Baylor University Medical Center",
        "city": "Dallas",
        "state": "TX",
        "email_domain": "bswhealth.com",
    },
    # Illinois
    {
        "name": "Northwestern Memorial Hospital",
        "city": "Chicago",
        "state": "IL",
        "email_domain": "nm.org",
    },
    {
        "name": "Rush University Medical Center",
        "city": "Chicago",
        "state": "IL",
        "email_domain": "rush.edu",
    },
    {
        "name": "University of Chicago Medical Center",
        "city": "Chicago",
        "state": "IL",
        "email_domain": "uchospitals.edu",
    },
    # Ohio
    {
        "name": "Cleveland Clinic",
        "city": "Cleveland",
        "state": "OH",
        "email_domain": "ccf.org",
    },
    {
        "name": "Ohio State University Wexner Medical Center",
        "city": "Columbus",
        "state": "OH",
        "email_domain": "osumc.edu",
    },
    # Michigan
    {
        "name": "University of Michigan Hospitals",
        "city": "Ann Arbor",
        "state": "MI",
        "email_domain": "med.umich.edu",
    },
    {
        "name": "Henry Ford Hospital",
        "city": "Detroit",
        "state": "MI",
        "email_domain": "hfhs.org",
    },
    # Washington
    {
        "name": "University of Washington Medical Center",
        "city": "Seattle",
        "state": "WA",
        "email_domain": "uw.edu",
    },
    {
        "name": "Swedish Medical Center",
        "city": "Seattle",
        "state": "WA",
        "email_domain": "swedish.org",
    },
    # Minnesota
    {
        "name": "Mayo Clinic",
        "city": "Rochester",
        "state": "MN",
        "email_domain": "mayo.edu",
    },
    # North Carolina
    {
        "name": "Duke University Hospital",
        "city": "Durham",
        "state": "NC",
        "email_domain": "duke.edu",
    },
    {
        "name": "UNC Hospitals",
        "city": "Chapel Hill",
        "state": "NC",
        "email_domain": "unchealthcare.org",
    },
    # Maryland
    {
        "name": "Johns Hopkins Hospital",
        "city": "Baltimore",
        "state": "MD",
        "email_domain": "jhmi.edu",
    },
    # Florida
    {
        "name": "Mayo Clinic Jacksonville",
        "city": "Jacksonville",
        "state": "FL",
        "email_domain": "mayo.edu",
    },
    {
        "name": "Cleveland Clinic Florida",
        "city": "Weston",
        "state": "FL",
        "email_domain": "ccf.org",
    },
    {
        "name": "Tampa General Hospital",
        "city": "Tampa",
        "state": "FL",
        "email_domain": "tgh.org",
    },
    # Georgia
    {
        "name": "Emory University Hospital",
        "city": "Atlanta",
        "state": "GA",
        "email_domain": "emoryhealthcare.org",
    },
    # Colorado
    {
        "name": "UCHealth University of Colorado Hospital",
        "city": "Aurora",
        "state": "CO",
        "email_domain": "uchealth.org",
    },
    # Missouri
    {
        "name": "Barnes-Jewish Hospital",
        "city": "St. Louis",
        "state": "MO",
        "email_domain": "bjc.org",
    },
    # Arizona
    {
        "name": "Mayo Clinic Phoenix",
        "city": "Phoenix",
        "state": "AZ",
        "email_domain": "mayo.edu",
    },
    # Virginia
    {
        "name": "University of Virginia Medical Center",
        "city": "Charlottesville",
        "state": "VA",
        "email_domain": "uvahealth.com",
    },
    # Tennessee
    {
        "name": "Vanderbilt University Medical Center",
        "city": "Nashville",
        "state": "TN",
        "email_domain": "vumc.org",
    },
    # Wisconsin
    {
        "name": "University of Wisconsin Hospital",
        "city": "Madison",
        "state": "WI",
        "email_domain": "uwhealth.org",
    },
    # Indiana
    {
        "name": "Indiana University Health",
        "city": "Indianapolis",
        "state": "IN",
        "email_domain": "iuhealth.org",
    },
    # Connecticut
    {
        "name": "Yale New Haven Hospital",
        "city": "New Haven",
        "state": "CT",
        "email_domain": "ynhh.org",
    },
]
