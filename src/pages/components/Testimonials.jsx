import React from "react";
import { Card, Avatar, Rate } from "antd";
import { UserOutlined, StarFilled } from "@ant-design/icons";

const testimonials = [
  {
    name: "Sarah Shamra",
    role: "HR Manager",
    company: "Tech Solutions Inc.",
    rating: 5,
    image: "https://xsgames.co/randomusers/avatar.php?g=female",
    text: "emsure has transformed how we handle employee insurance. The platform is intuitive and the support team is exceptional.",
  },
  {
    name: "Saroj Nepal",
    role: "CEO",
    company: "Innovate Corp",
    rating: 5,
    image: "https://xsgames.co/randomusers/avatar.php?g=male",
    text: "The comprehensive coverage options and seamless claims process make emsure our preferred insurance partner.",
  },
  {
    name: "Sharin Gajurel",
    role: "Benefits Specialist",
    company: "Global Enterprises",
    rating: 5,
    image: "https://xsgames.co/randomusers/avatar.php?g=female",
    text: "Managing employee benefits has never been easier. The digital platform saves us countless hours.",
  },
  {
    name: "Natasha Shahi",
    role: "Operations Director",
    company: "Future Systems",
    rating: 5,
    image: "https://xsgames.co/randomusers/avatar.php?g=male",
    text: "The customer service is outstanding, and the claims process is straightforward. Highly recommended!",
  },
  {
    name: "Alisha Basnet",
    role: "HR Director",
    company: "Creative Solutions",
    rating: 5,
    image: "https://xsgames.co/randomusers/avatar.php?g=female",
    text: "emsure provides excellent coverage options and their support team is always ready to help.",
  },
  {
    name: "Vikram K.C.",
    role: "Managing Director",
    company: "Tech Innovators",
    rating: 5,
    image: "https://xsgames.co/randomusers/avatar.php?g=male",
    text: "The platform's user-friendly interface and comprehensive features make it a game-changer for employee insurance.",
  },
];

const Testimonials = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover why companies choose emsure for their employee insurance
            needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="h-full hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <Avatar
                  size={48}
                  src={testimonial.image}
                  icon={<UserOutlined />}
                  className="mr-4"
                />
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
              <Rate
                disabled
                defaultValue={testimonial.rating}
                className="mb-4"
                character={<StarFilled className="text-yellow-400" />}
              />
              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
