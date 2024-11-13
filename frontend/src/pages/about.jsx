import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: 'About PickItUp | Your Local E-commerce Solution',
  description: 'Learn about PickItUp, your go-to platform for local shopping and quick pickups.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">About PickItUp</h1>
      
      <div className="grid md:grid-cols-2 gap-8 items-center mb-12">

        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-lg mb-4">
            Founded in 2024, PickItUp was born from a simple idea: to bridge the gap between online
            convenience and local shopping. We believe in supporting local businesses while providing
            our customers with the ease of online ordering and quick pickups.
          </p>
          <p className="text-lg">
            Our platform connects you with a wide range of local stores, allowing you to browse,
            order, and pick up your items at your convenience. It's the best of both worlds -
            the vast selection of online shopping with the immediacy of local pickup.
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-semibold mb-6 text-center">Why Choose PickItUp?</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Support Local</CardTitle>
          </CardHeader>
          <CardContent>
            By shopping with PickItUp, you're supporting local businesses and helping your community thrive.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Convenience</CardTitle>
          </CardHeader>
          <CardContent>
            Browse and order from multiple local stores in one place, then pick up when it's convenient for you.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quality Assured</CardTitle>
          </CardHeader>
          <CardContent>
            We partner with trusted local businesses to ensure you always receive high-quality products.
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Join the PickItUp Community</h2>
        <p className="text-lg mb-6">
          Whether you're a shopper looking for convenience or a local business looking to expand your reach,
          PickItUp is here for you. Join us in revolutionizing the way we shop locally.
        </p>
        <p className="text-lg font-semibold">
          PickItUp - Your Local E-commerce Solution
        </p>
      </div>
    </div>
  )
}