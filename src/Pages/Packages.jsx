import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "./Packages.css";

const packagesData = [
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    location: "Kodaikanal, Tamil Nadu",
    title: "Hill Station Getaway",
    desc: "3 days of lakes, silver cascades, and cool mountain air high above the clouds.",
    price: 2199,
    duration: "3 Days",
    category: "Nature",
    badge: "New",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
    location: "Ooty, Tamil Nadu",
    title: "Nilgiri Explorer",
    desc: "3 days exploring the Blue Mountains with iconic toy train rides and rose gardens.",
    price: 1999,
    duration: "3 Days",
    category: "Nature",
    badge: "",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    location: "Coorg, Karnataka",
    title: "Coffee Plantation Tour",
    desc: "3 days among lush coffee estates, Abbey Falls, and misty hills of Coorg.",
    price: 2299,
    duration: "3 Days",
    category: "Nature",
    badge: "Serene",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
    location: "Wayanad, Kerala",
    title: "Wayanad Wilderness",
    desc: "4 days of jungle trails, bamboo cottages, waterfalls, and tribal village visits.",
    price: 2799,
    duration: "4 Days",
    category: "Nature",
    badge: "",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    location: "Spiti Valley, HP",
    title: "Spiti Valley Expedition",
    desc: "6 days traversing high-altitude deserts, ancient monasteries, and star-lit Himalayan skies.",
    price: 5999,
    duration: "6 Days",
    category: "Nature",
    badge: "Stunning",
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    location: "Shimla, Himachal Pradesh",
    title: "Shimla Snow Escape",
    desc: "4 days of colonial charm, snow-capped peaks, Mall Road strolls, and pine forest walks.",
    price: 3299,
    duration: "4 Days",
    category: "Nature",
    badge: "",
  },
  {
    id: 8,
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    location: "Goa",
    title: "Goa Sunset Beach",
    desc: "5 days of golden beaches, Portuguese heritage, fresh seafood, and vibrant nightlife.",
    price: 3499,
    duration: "5 Days",
    category: "Nature",
    badge: "",
  },
  {
    id: 9,
    img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80",
    location: "Meghalaya",
    title: "Meghalaya Cloud Forest",
    desc: "5 days exploring living root bridges, Cherrapunji waterfalls, and misty valleys.",
    price: 4299,
    duration: "5 Days",
    category: "Nature",
    badge: "Hidden Gem",
  },
  {
    id: 10,
    img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
    location: "Sundarbans, West Bengal",
    title: "Sundarbans Mangrove Safari",
    desc: "3 days of boat safaris through the world's largest mangrove delta, spotting Royal Bengal Tigers.",
    price: 3799,
    duration: "3 Days",
    category: "Nature",
    badge: "Wildlife",
  },

  // ── Leisure ──
  {
    id: 11,
    img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&q=80",
    location: "Alleppey, Kerala",
    title: "Backwater Houseboat",
    desc: "2 nights drifting through serene backwaters on a luxury houseboat with all meals included.",
    price: 2899,
    duration: "3 Days",
    category: "Leisure",
    badge: "Bestseller",
  },
  {
    id: 12,
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    location: "Varkala, Kerala",
    title: "Cliff Beach Escape",
    desc: "4 days of pristine cliff beaches, sunrise yoga sessions, and Ayurvedic spa treatments.",
    price: 2699,
    duration: "4 Days",
    category: "Leisure",
    badge: "Relaxing",
  },
  {
    id: 13,
    img: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
    location: "Agra, Uttar Pradesh",
    title: "Taj Mahal Heritage Tour",
    desc: "3 days exploring the wonder of the world, Mughal forts, and old bazaars.",
    price: 2999,
    duration: "3 Days",
    category: "Leisure",
    badge: "Heritage",
  },
  {
    id: 14,
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
    location: "Jaipur, Rajasthan",
    title: "Pink City Royal Tour",
    desc: "4 days of majestic forts, palace dinners, elephant rides, and camel trails in Rajasthan.",
    price: 3799,
    duration: "4 Days",
    category: "Leisure",
    badge: "Royal",
  },
  {
    id: 15,
    img: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80",
    location: "Udaipur, Rajasthan",
    title: "Lake City Luxury",
    desc: "4 days in the City of Lakes — palaces on water, sunset boat rides, and live folk music.",
    price: 4299,
    duration: "4 Days",
    category: "Leisure",
    badge: "Luxury",
  },
  {
    id: 16,
    img: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800&q=80",
    location: "Andaman Islands",
    title: "Andaman Island Bliss",
    desc: "5 days of crystal-clear waters, white sand beaches, and vibrant coral reef snorkelling.",
    price: 5499,
    duration: "5 Days",
    category: "Leisure",
    badge: "Paradise",
  },
  {
    id: 17,
    img: "https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?w=800&q=80",
    location: "Pondicherry",
    title: "French Quarter Retreat",
    desc: "3 days of colonial boulevards, beach promenades, and authentic French-Tamil cuisine.",
    price: 1899,
    duration: "3 Days",
    category: "Leisure",
    badge: "",
  },
  {
    id: 18,
    img: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80",
    location: "Lakshadweep",
    title: "Lakshadweep Island Hopping",
    desc: "5 days hopping coral atolls, snorkelling turquoise lagoons, and relaxing on untouched beaches.",
    price: 6999,
    duration: "5 Days",
    category: "Leisure",
    badge: "Exclusive",
  },
  {
    id: 19,
    img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
    location: "Jodhpur, Rajasthan",
    title: "Blue City Sojourn",
    desc: "3 days exploring the iconic blue-washed lanes, Mehrangarh Fort, and spice markets.",
    price: 2599,
    duration: "3 Days",
    category: "Leisure",
    badge: "",
  },
  {
    id: 20,
    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
    location: "Varanasi, UP",
    title: "Varanasi Spiritual Journey",
    desc: "3 days of Ganga Aarti, temple walks, silk weaving, and ancient ghats exploration.",
    price: 1999,
    duration: "3 Days",
    category: "Cultural",
    badge: "Spiritual",
  },

  // ── Adventure ──
  {
    id: 21,
    img: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=80",
    location: "Western Ghats",
    title: "Western Ghats Trek",
    desc: "5 days of thrilling treks, jungle camping, waterfalls, and wildlife spotting.",
    price: 3499,
    duration: "5 Days",
    category: "Adventure",
    badge: "Thrilling",
  },
  {
    id: 22,
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    location: "Manali, Himachal Pradesh",
    title: "Manali Mountain Rush",
    desc: "5 days of river rafting, snow treks, bonfires, and the iconic Rohtang Pass.",
    price: 4499,
    duration: "5 Days",
    category: "Adventure",
    badge: "Extreme",
  },
  {
    id: 23,
    img: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800&q=80",
    location: "Rishikesh, Uttarakhand",
    title: "Rishikesh River Rush",
    desc: "3 days of white-water rafting, bungee jumping, cliff jumping, and Ganga Aarti.",
    price: 2999,
    duration: "3 Days",
    category: "Adventure",
    badge: "Bestseller",
  },
  {
    id: 24,
    img: "https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=800&q=80",
    location: "Ladakh, J&K",
    title: "Ladakh Bike Expedition",
    desc: "7 days riding through the world's highest motorable roads, Pangong Lake, and frozen passes.",
    price: 7999,
    duration: "7 Days",
    category: "Adventure",
    badge: "Epic",
  },
  {
    id: 25,
    img: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80",
    location: "Auli, Uttarakhand",
    title: "Auli Skiing Adventure",
    desc: "4 days of skiing on pristine Himalayan slopes with certified instructors and snow camps.",
    price: 4999,
    duration: "4 Days",
    category: "Adventure",
    badge: "Winter",
  },
  {
    id: 26,
    img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    location: "Jim Corbett, Uttarakhand",
    title: "Corbett Safari",
    desc: "3 days of thrilling jungle safaris, tiger spotting, and peaceful riverside camping.",
    price: 3299,
    duration: "3 Days",
    category: "Adventure",
    badge: "Wildlife",
  },
  {
    id: 27,
    img: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&q=80",
    location: "Rann of Kutch, Gujarat",
    title: "Rann of Kutch Camp",
    desc: "3 days of white salt desert camping, camel rides, folk music nights, and stargazing.",
    price: 2999,
    duration: "3 Days",
    category: "Adventure",
    badge: "",
  },
  {
    id: 28,
    img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80",
    location: "Zanskar Valley, J&K",
    title: "Zanskar River Rafting",
    desc: "6 days of rafting through dramatic gorges, camping on riverbanks, and monastery visits.",
    price: 6499,
    duration: "6 Days",
    category: "Adventure",
    badge: "Extreme",
  },
  {
    id: 29,
    img: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80",
    location: "Chopta, Uttarakhand",
    title: "Tungnath Trek",
    desc: "3 days trekking to the highest Shiva temple in the world with panoramic Himalayan views.",
    price: 2199,
    duration: "3 Days",
    category: "Adventure",
    badge: "Scenic",
  },
  {
    id: 30,
    img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    location: "Kedarkantha, Uttarakhand",
    title: "Kedarkantha Winter Trek",
    desc: "5 days of snow trek through dense oak and pine forests to a stunning 12,500 ft summit.",
    price: 3799,
    duration: "5 Days",
    category: "Adventure",
    badge: "Winter",
  },

  // ── Cultural ──
  {
    id: 31,
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    location: "Hampi, Karnataka",
    title: "Hampi Ruins Explorer",
    desc: "3 days among UNESCO world heritage ruins, giant boulders, and peaceful coracle rides.",
    price: 1799,
    duration: "3 Days",
    category: "Cultural",
    badge: "Heritage",
  },
  {
    id: 32,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    location: "Mysore, Karnataka",
    title: "Mysore Palace & Culture",
    desc: "3 days visiting the grand illuminated palace, silk markets, sandalwood shops, and Dasara.",
    price: 1899,
    duration: "3 Days",
    category: "Cultural",
    badge: "",
  },
  {
    id: 33,
    img: "https://images.unsplash.com/photo-1600689617936-d3b7a285db08?w=800&q=80",
    location: "Amritsar, Punjab",
    title: "Golden Temple Pilgrimage",
    desc: "2 days at the sacred Golden Temple, Wagah Border ceremony, and Punjabi food trail.",
    price: 1599,
    duration: "2 Days",
    category: "Cultural",
    badge: "Sacred",
  },
  {
    id: 34,
    img: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
    location: "Kolkata, West Bengal",
    title: "City of Joy Heritage Walk",
    desc: "3 days exploring Victorian architecture, Durga Puja culture, and legendary street food.",
    price: 1699,
    duration: "3 Days",
    category: "Cultural",
    badge: "",
  },
  {
    id: 35,
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    location: "Pushkar, Rajasthan",
    title: "Pushkar Camel Fair",
    desc: "3 days at the world-famous camel fair — folk performances, desert camping, and the sacred lake.",
    price: 2399,
    duration: "3 Days",
    category: "Cultural",
    badge: "Unique",
  },
  {
    id: 36,
    img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
    location: "Khajuraho, MP",
    title: "Khajuraho Temple Trail",
    desc: "2 days exploring the UNESCO-listed erotic temple sculptures and classical dance performances.",
    price: 1899,
    duration: "2 Days",
    category: "Cultural",
    badge: "Heritage",
  },

  // ── Wellness ──
  {
    id: 37,
    img: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80",
    location: "Thrissur, Kerala",
    title: "Kerala Ayurveda Retreat",
    desc: "5 days of traditional Panchakarma treatments, herbal baths, yoga, and healing cuisine.",
    price: 4999,
    duration: "5 Days",
    category: "Wellness",
    badge: "Healing",
  },
  {
    id: 38,
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    location: "Rishikesh, Uttarakhand",
    title: "Yoga & Meditation Retreat",
    desc: "5 days of sunrise yoga, sound healing, pranayama, and spiritual detox by the Ganges.",
    price: 3499,
    duration: "5 Days",
    category: "Wellness",
    badge: "Peaceful",
  },
  {
    id: 39,
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    location: "Coorg, Karnataka",
    title: "Forest Spa & Wellness",
    desc: "4 days of forest bathing, organic spa treatments, and mindfulness walks in misty Coorg.",
    price: 3999,
    duration: "4 Days",
    category: "Wellness",
    badge: "Rejuvenating",
  },
  {
    id: 40,
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    location: "Dharamshala, HP",
    title: "Tibetan Wellness Escape",
    desc: "4 days of Tibetan medicine, Buddhist meditation, mountain hikes, and monastery retreats.",
    price: 3299,
    duration: "4 Days",
    category: "Wellness",
    badge: "Spiritual",
  },
  {
    id: 41,
    img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80",
    location: "Bangalore, Karnataka",
    title: "Urban Wellness Weekend",
    desc: "2 days of luxury spa, rooftop yoga, farm-to-table dining, and digital detox in the Garden City.",
    price: 1799,
    duration: "2 Days",
    category: "Wellness",
    badge: "",
  },
  {
    id: 42,
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    location: "Kovalam, Kerala",
    title: "Kovalam Beachside Detox",
    desc: "5 days of beachfront Ayurveda, seafood diet plans, swimming, and sunset meditation.",
    price: 4199,
    duration: "5 Days",
    category: "Wellness",
    badge: "Detox",
  }
];

const categories = ["All", "Nature", "Leisure", "Adventure", "Cultural", "Wellness"];

function Packages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState(packagesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPackages();
  }, [active, search]);

  async function fetchPackages() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (active !== "All") params.category = active;
      if (search) params.search = search;
      
      const { data } = await api.get("/trips", { params });
      setPackages(data.data && data.data.length > 0 ? data.data : packagesData);
    } catch (err) {
      // Use local data as fallback
      setPackages(packagesData);
      console.log("Using local packages data as fallback");
    } finally {
      setLoading(false);
    }
  }

  const filtered = packages;

  function handleBookNow(pkgId) {
    if (!user) {
      navigate(`/login?redirect=/apply?pkg=${pkgId}`);
    } else {
      navigate(`/apply?pkg=${pkgId}`);
    }
  }

  return (
    <div>
      <div className="page-hero">
        <h1>🌿 All Packages</h1>
        <p>Explore our curated collection of 42 handpicked travel experiences across India</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="pkg-filters">
            <input
              type="text"
              className="form-control pkg-search"
              placeholder="🔍  Search destinations or packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filter-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`filter-tab ${active === c ? "active" : ""}`}
                  onClick={() => setActive(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <p className="pkg-count">
            {filtered.length} package{filtered.length !== 1 ? "s" : ""} found
          </p>

          {loading ? (
            <div className="no-results">
              <p>Loading packages...</p>
            </div>
          ) : error ? (
            <div className="no-results">
              <p style={{ color: "#EF4444" }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-results">
              <p>😕 No packages found. Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid-3" style={{ marginTop: 16 }}>
              {filtered.map((p) => (
                <div className="card pkg-card" key={p._id}>
                  <div className="pkg-img" style={{ backgroundImage: `url(${p.images?.featured || p.img || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'})` }}>
                    {p.badge && <span className="badge badge-gold">{p.badge}</span>}
                    <span className="pkg-duration">{p.duration?.days || p.duration} Days</span>
                    <span className="pkg-category-tag">{p.category}</span>
                  </div>
                  <div className="pkg-body">
                    <p className="pkg-location">📍 {p.location?.city || p.location}, {p.location?.state || ''}</p>
                    <h3>{p.title}</h3>
                    <p className="pkg-desc">{p.description || p.desc}</p>
                    <div className="pkg-footer">
                      <span className="pkg-price">
                        ₹{(p.pricing?.basePrice || p.price)?.toLocaleString()} <small>/person</small>
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleBookNow(p._id)}
                      >
                        {user ? "Book Now" : "🔒 Book Now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Packages;
