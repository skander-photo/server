import { Request, Response } from 'express';
import { getRepository, IsNull, Not } from 'typeorm';
import { Album } from '../models/album';
import { Category } from '../models/category';

class AlbumsController {
  albumRepository = getRepository(Album);
  categoryRepository = getRepository(Category);

  indexView = async (req: Request, res: Response) => {
    const albumsWithCategoryPromise = this.albumRepository.find({
      relations: ['category'],
      where: {
        category: Not(IsNull()),
      },
      order: {
        title: 'ASC',
      },
    });

    const albumsWithoutCategoryPromise = this.albumRepository.find({
      where: {
        category: IsNull(),
      },
      order: {
        title: 'ASC',
      },
    });

    const [albumsWithCategory, albumsWithoutCategory] = await Promise.all([
      albumsWithCategoryPromise,
      albumsWithoutCategoryPromise,
    ]);

    return res.render('albums/index', { albumsWithCategory, albumsWithoutCategory });
  };

  newView = async (req: Request, res: Response) => {};

  create = async (req: Request, res: Response) => {};

  editView = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return;

    try {
      const album = await this.albumRepository.findOne(id, {
        relations: ['category', 'pictures'],
      });
      const categories = await this.getCategoriesWithSelection();
      return res.render('albums/edit', { album, categories });
    } catch (err) {
      return res.render('/albums', { error: err });
    }
  };

  update = async (req: Request, res: Response) => {};

  delete = async (req: Request, res: Response) => {};

  private getCategoriesWithSelection = async (album?: Album) => {
    const categories = await this.categoryRepository.find();
    return categories.map((category) => ({
      ...category,
      isSelected: category.id === album?.category?.id,
    }));
  };
}

export const albumsController = new AlbumsController();
